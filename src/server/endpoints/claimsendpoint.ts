/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { ErrorCause } from "../../shared/errors";
import { IClaim } from "../../shared/kills";
import { NotificationCause } from "../../shared/notifications";
import { IUser } from "../../shared/users";
import { ICredentials } from "../../shared/login";
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
    public async getAll(): Promise<IClaim[]> {
        return this.collection.find().toArray();
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
