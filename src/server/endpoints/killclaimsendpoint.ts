/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { IKillClaim } from "../../shared/kills";
import { IUser } from "../../shared/users";
import { ICredentials } from "../../shared/login";
import { ErrorCause, ServerError } from "../errors";
import { Endpoint } from "./endpoint";

/**
 * Mock database storage for kill claims.
 */
export class KillClaimsEndpoint extends Endpoint<IReport<IKillClaim>> {
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
    public async get(credentials: ICredentials, query: any): Promise<IReport<IKillClaim>[]> {
        const user: IUser = await this.validateUserSubmission(credentials);
        const claims: IReport<IKillClaim>[] = await this.collection.find(query).toArray();

        // Only admins can only view claims regarding other users
        if (user.admin) {
            return claims;
        }

        return claims
            // Regular users can only see reports regarding themselves
            .filter(
                (report: IReport<IKillClaim>): boolean =>
                    user.alias === report.data.killer || user.alias === report.data.victim)
            .map(
                (report: IReport<IKillClaim>): IReport<IKillClaim> => {
                    // They also can't see the alias of reports claiming they've died
                    if (user.alias === report.data.victim) {
                        delete report.data.killer;
                    }

                    return report;
                });
    }

    /**
     * Adds a new kill claim.
     * 
     * @param credentials   Login values for authentication.
     * @param claim   A kill claim to add.
     * @returns A promise for the kill claim, if added successfully.
     */
    public async put(credentials: ICredentials, claim: IKillClaim): Promise<IReport<IKillClaim>> {
        const user: IUser = await this.validateUserSubmission(credentials);

        // You can only claim a kill on yourself or your target
        if (user.alias !== claim.victim && user.alias !== claim.killer) {
            throw new ServerError(ErrorCause.PermissionDenied);
        }

        // Retrieve the killer and victim users
        const userReports: IReport<IUser>[] = await this.api.endpoints.users.getByAliases(credentials, [claim.killer, claim.victim]);
        const [killer, victim] = [userReports[0].data, (userReports[1] || userReports[0]).data];

        if (!killer.alive) {
            throw new ServerError(ErrorCause.UsersDead, killer.alias);
        }
        if (!victim.alive) {
            throw new ServerError(ErrorCause.UsersDead, victim.alias);
        }

        // Don't allow duplicate claims
        if (await this.collection.findOne({
                "data.killer": claim.killer,
                "data.victim": claim.victim
            })) {
            throw new ServerError(ErrorCause.ClaimAlreadyExists, victim.alias);
        }

        // Add the claim to the database
        const report: IReport<IKillClaim> = this.wrapSubmission(credentials, claim);
        await this.collection.insertOne(report);

        // Only change death status when the victim says so
        if (killer.alias === victim.alias) {
            victim.alive = false;
        } else {
            killer.target = victim.target;
        }

        // Update the corresponding users
        await this.api.endpoints.users.update({
            data: killer,
            reporter: killer.alias,
            timestamp: Date.now()
        });
        await this.api.endpoints.users.update({
            data: victim,
            reporter: victim.alias,
            timestamp: Date.now()
        });

        // Only report a death when the victim says so
        if (!victim.alive) {
            this.api.fireReportCallback(report);
        }

        return report;
    }
}
