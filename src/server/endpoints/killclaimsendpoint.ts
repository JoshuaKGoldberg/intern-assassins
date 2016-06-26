/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { ErrorCause } from "../../shared/errors";
import { IKillClaim } from "../../shared/kills";
import { NotificationCause } from "../../shared/notifications";
import { IUser } from "../../shared/users";
import { ICredentials } from "../../shared/login";
import { NotAuthorizedError, ServerError } from "../errors";
import { Endpoint } from "./endpoint";

/**
 * Mock database storage for kill claims.
 */
export class KillClaimsEndpoint extends Endpoint<IKillClaim> {
    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "kills";
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
    public async get(credentials: ICredentials, query: any): Promise<IKillClaim[]> {
        const user: IUser = await this.validateUserCredentials(credentials);
        let killClaims: IKillClaim[] = await this.collection.find(query).toArray();

        // Regular users only care about reports of their kills or deaths
        if (!user.admin) {
            killClaims = killClaims.filter((killClaim: IKillClaim): boolean => {
                return user.alias === killClaim.killer || user.alias === killClaim.victim;
            });
        }

        return killClaims;
    }

    /**
     * Adds a new kill claim.
     * 
     * @param credentials   Login values for authentication.
     * @param claim   A kill claim to add.
     * @returns A promise for the kill claim, if added successfully.
     */
    public async put(credentials: ICredentials, claim: IKillClaim): Promise<IKillClaim> {
        this.validateKillClaim(claim);
        const user: IUser = await this.validateUserCredentials(credentials);

        // Non-admins can only claim a kill on themselves or their target
        if (!user.admin && user.alias !== claim.victim && user.alias !== claim.killer) {
            throw new NotAuthorizedError();
        }

        // Retrieve the killer and victim users
        const users: IUser[] = await this.api.endpoints.users.getByAliases(credentials, [claim.killer, claim.victim]);
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
            await this.finalizeKill(victim);
        } else {
            await this.api.fireNotificationCallbacks({
                cause: NotificationCause.KillClaimToKiller,
                description: `You claimed to have killed ${victim.alias}.`,
                nickname: killer.nickname,
                timestamp: Date.now()
            });
            await this.api.fireNotificationCallbacks({
                cause: NotificationCause.KillClaimToVictim,
                description: `Someone claims to have killed you.`,
                nickname: victim.nickname,
                timestamp: Date.now()
            });
            await this.api.endpoints.users.update(killer);
        }

        return claim;
    }

    /**
     * @returns All kill claims.
     */
    public async getAll(): Promise<IKillClaim[]> {
        return this.collection.find().toArray();
    }

    /**
     * Validates that a kill claim has the required fields.
     */
    private validateKillClaim(claim: IKillClaim): void {
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
     * Marks a kill as having completed when the victim says it has.
     * 
     * @param victim   A user that should now be dead.
     * @returns A promise for the victim being officially dead.
     */
    private async finalizeKill(victim: IUser): Promise<void> {
        const killers: IUser[] = await this.api.endpoints.users.query({
            target: victim.alias
        });

        if (killers.length !== 1) {
            throw new ServerError(ErrorCause.Unknown, `Nobody is targeting '${victim.alias}'.`);
        }

        const killer: IUser = killers[0];

        // Update the killer: add a kill and set the target to the victim's
        killer.kills += 1;
        killer.target = victim.target;
        await this.api.endpoints.users.update(killer);

        // Update the victim: no longer alive or with a target
        victim.alive = false;
        victim.target = "";
        await this.api.endpoints.users.update(victim);

        // Add a kill claim from the killer to the victim if one doesn't yet exist
        const existingKillerClaim: IKillClaim = await this.collection.findOne({
            killer: killer.alias,
            victim: victim.alias
        });

        if (!existingKillerClaim) {
            await this.collection.insertOne({
                killer: killer.alias,
                victim: victim.alias,
                timestamp: Date.now()
            });
        }

        await this.api.fireNotificationCallbacks({
            cause: NotificationCause.Kill,
            description: `${killer.nickname} has scored a kill!`,
            nickname: killer.nickname,
            timestamp: Date.now()
        });

        await this.api.fireNotificationCallbacks({
            cause: NotificationCause.Death,
            description: `Oh no! ${victim.nickname} died!`,
            nickname: victim.nickname,
            timestamp: Date.now()
        });
    }
}
