"use strict";
import { ErrorCause } from "../../shared/errors";
import { IClaim } from "../../shared/kills";
import { NotificationCause } from "../../shared/notifications";
import { IUser } from "../../shared/users";
import { ICredentials } from "../../shared/login";
import { Delay } from "../cron/delays";
import { NotAuthorizedError, ServerError } from "../errors";
import { Endpoint } from "./endpoint";

/**
 * Endpoint for claimed kills.
 */
export class ClaimsEndpoint extends Endpoint<IClaim> {
    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "claims";
    }

    /**
     * Retrieves kill claims.
     * 
     * @param credentials   Login values for authentication.
     * @param query   A filter on the kill claims.
     * @returns Filtered kill claims.
     * @remarks It would be more efficient to modify the filter for non-admin
     *          users, rather than the post-query results.
     */
    public async get(credentials: ICredentials, query: any): Promise<IClaim[]> {
        const user: IUser = await this.validateUserCredentials(credentials);
        let claims: IClaim[] = await this.collection.find(query).toArray();

        // Admins can view all claims no matter what
        if (user.admin) {
            return claims;
        }

        return claims
            // Regular users only care about reports of their kills or deaths
            .filter((claim: IClaim): boolean => {
                return user.alias === claim.killer || user.alias === claim.victim;
            })
            // Victims can't see the alias of their killer
            .map((claim: IClaim): IClaim => {
                if (claim.victim === user.alias) {
                    return {
                        killer: undefined,
                        victim: claim.victim,
                        timestamp: claim.timestamp
                    };
                }

                return claim;
            });
    }

    /**
     * Adds a new kill claim.
     * 
     * @param credentials   Login values for authentication.
     * @param claim   A kill claim to add.
     * @returns A promise for the kill claim, if added successfully.
     */
    public async put(credentials: ICredentials, claim: IClaim): Promise<IClaim> {
        this.validateClaim(claim);
        const user: IUser = await this.validateUserCredentials(credentials);

        // Non-admins can only claim a kill on themselves or their target
        if (!user.admin && user.alias !== claim.victim && user.alias !== claim.killer) {
            throw new NotAuthorizedError();
        }

        // Retrieve the killer and victim users
        const users: IUser[] = await this.api.endpoints.users.getByAliases([claim.killer, claim.victim]);
        const [killer, victim] = [users[0], (users[1] || users[0])];

        if (!killer.alive) {
            throw new ServerError(ErrorCause.UsersDead, killer.alias);
        }
        if (!victim.alive) {
            throw new ServerError(ErrorCause.UsersDead, victim.alias);
        }

        // Don't allow duplicate claims
        if (await this.collection.findOne({
                killer: claim.killer,
                victim: claim.victim
            })) {
            throw new ServerError(ErrorCause.ClaimAlreadyExists, claim);
        }

        // Add the claim to the database
        await this.collection.insertOne(claim);

        // Only change death status when the victim says so
        if (killer.alias === victim.alias) {
            await this.api.endpoints.kills.finalizeDeath(victim);
            return claim;
        }

        await this.api.endpoints.users.update(killer);
        await this.api.fireNotificationCallbacks({
            cause: NotificationCause.KillClaimToKiller,
            description: `You claimed to have killed ${victim.alias}.`,
            codename: killer.codename,
            timestamp: Date.now()
        });
        await this.api.fireNotificationCallbacks({
            cause: NotificationCause.KillClaimToVictim,
            description: `Someone claims to have killed you.`,
            codename: victim.codename,
            timestamp: Date.now()
        });

        this.api.scheduler.delay(
            Delay.minute,
            (): void => this.scheduleFollowupReminders(killer, victim));

        return claim;
    }

    /**
     * @returns All kill claims.
     */
    public async getAll(): Promise<IClaim[]> {
        return this.collection.find().toArray();
    }

    /**
     * Deletes a kill claim.
     * 
     * @param credentials   Login values for authentication.
     * @param claim   A claim to delete.
     * @returns A promise for deleting the claim.
     */
    public async delete(credentials: ICredentials, claim: IClaim): Promise<void> {
        await this.validateAdminCredentials(credentials);
        await this.collection.deleteOne(claim);
    }

    /**
     * Deletes all claims against a victim.
     * 
     * @param victim   A user the claims are against.
     * @returns A promise for deleting the claims.
     */
    public async deleteClaimsAgainst(victim: IUser): Promise<void> {
        await this.collection.deleteMany({
            victim: victim.alias
        });
    }

    /**
     * Validates that a kill claim has the required fields.
     */
    private validateClaim(claim: IClaim): void {
        if (claim.killer && claim.victim) {
            return;
        }

        const missingFields: string[] = [];
        if (!claim.killer) {
            missingFields.push("killer");
        }
        if (!claim.victim) {
            missingFields.push("victim");
        }

        throw new ServerError(ErrorCause.MissingFields, missingFields);
    }

    /**
     * Schedules reminder emails for after a killer files a claim.
     * 
     * @param killer   The claiming user.
     * @param victim   The supposedly killed user.
     */
    private scheduleFollowupReminders(killer: IUser, victim: IUser): void {
        this.api.scheduler.delayChain({
            [Delay.minute * 10]: async (): Promise<boolean> => {
                if (!(await this.isClaimStillOpen(killer.alias, victim.alias))) {
                    return true;
                }

                await this.api.fireNotificationCallbacks({
                    cause: NotificationCause.KillClaimToKillerReminder,
                    description: `${victim.alias} hasn't confirmed you've killed them. Remind them to!`,
                    codename: killer.codename,
                    timestamp: Date.now()
                });
                await this.api.fireNotificationCallbacks({
                    cause: NotificationCause.KillClaimToVictimReminder,
                    description: `You still haven't confirmed you've been killed. Either do so or dispute the claim soon!`,
                    codename: victim.codename,
                    timestamp: Date.now()
                });

                return false;
            },
            [Delay.hour]: async (): Promise<boolean> => {
                if (!(await this.isClaimStillOpen(killer.alias, victim.alias))) {
                    return true;
                }

                await this.api.fireNotificationCallbacks({
                    cause: NotificationCause.KillClaimToKillerReminder,
                    description: `${victim.alias} still hasn't confirmed you've killed them. Remind them to!`,
                    codename: killer.codename,
                    timestamp: Date.now()
                });
                await this.api.fireNotificationCallbacks({
                    cause: NotificationCause.KillClaimToVictimReminder,
                    description: `You still haven't confirmed you've been killed. Either do so or dispute the claim within the next two hours!`,
                    codename: victim.codename,
                    timestamp: Date.now()
                });

                return false;
            },
            [Delay.hour * 3]: async (): Promise<boolean> => {
                if (!(await this.isClaimStillOpen(killer.alias, victim.alias))) {
                    return true;
                }

                this.api.endpoints.kills.finalizeDeath(victim);

                await this.api.fireNotificationCallbacks({
                    cause: NotificationCause.KillClaimToKillerReminder,
                    description: `${victim.alias} never confirmed you've killed them. We've auto-killed them for you.`,
                    codename: killer.codename,
                    timestamp: Date.now()
                });
                await this.api.fireNotificationCallbacks({
                    cause: NotificationCause.KillClaimToVictimReminder,
                    description: `You never confirmed you've been killed so we've confirmed the kill automatically. You can dispute the claim if you feel it was unjust.`,
                    codename: victim.codename,
                    timestamp: Date.now()
                });

                return false;
            }
        });
    }

    /**
     * Determines if there's still a claim between users.
     * 
     * @param killer   Alias of a killer.
     * @param killer   Alias of a vitim.
     * @returns A promise for whether there's a claim between users.
     */
    private async isClaimStillOpen(killer: string, victim: string): Promise<boolean> {
        return !!(await this.collection.find({ killer, victim }));
    }
}
