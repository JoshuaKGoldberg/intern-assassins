"use strict";
import { ErrorCause } from "../../shared/errors";
import { ClaimAction, IClaim } from "../../shared/kills";
import { NotificationCause } from "../../shared/notifications";
import { IUser } from "../../shared/users";
import { ICredentials } from "../../shared/login";
import { NotAuthorizedError, ServerError } from "../errors";
import { Endpoint } from "./endpoint";

/**
 * Data from a POST request to act on a claim.
 */
interface IClaimPost {
    /**
     * The action to take on the claim.
     */
    action: ClaimAction;

    /**
     * The claim to be acted on.
     */
    claim: IClaim;
}

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
     * @remarks Admins are given all claims, whereas regular users are given
     *          claims related to them.
     */
    public async get(credentials: ICredentials): Promise<IClaim[]> {
        const user: IUser = await this.validateUserCredentials(credentials);
        let query: any;

        if (user.admin) {
            query = {};
        } else {
            query = {
                $or: [
                    {
                        killer: user.alias
                    },
                    {
                        victim: user.alias
                    }
                ]
            };
        }

        const claims: IClaim[] = await this.collection.find(query).toArray();

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

        return claim;
    }

    /**
     * Performs an action on a claim.
     * 
     * @param credentials   Login credentials for authentication.
     * @param data   A claim and an action to take on it.
     * @returns A promise for taking the action on the claim.
     */
    public async post(credentials: ICredentials, data: IClaimPost): Promise<void> {
        await this.validateAdminCredentials(credentials);

        switch (data.action) {
            case ClaimAction.Approve:
                const victim: IUser = await this.api.endpoints.users.getByAlias(data.claim.victim);
                await this.api.endpoints.kills.finalizeDeath(victim);
                break;

            case ClaimAction.Deny:
                await this.collection.deleteMany({
                    killer: data.claim.killer,
                    victim: data.claim.victim
                });
                break;

            default:
                throw new ServerError(ErrorCause.InvalidData, data);
        }
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
    public async deleteClaimsWith(victim: IUser): Promise<void> {
        await this.collection.deleteMany({
            victim: victim.alias
        });
        await this.collection.deleteMany({
            killer: victim.alias
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
}
