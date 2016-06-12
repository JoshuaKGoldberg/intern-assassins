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
 * 
 * @todo Use MongoDB...
 */
export class KillClaimsEndpoint extends Endpoint<IReport<IKillClaim>> {
    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "kills";
    }

    /**
     * Adds a new kill claim.
     * 
     * @param credentials   Login values for authentication.
     * @param claim   A kill claim to add.
     * @returns A promise for the kill claim, if added successfully.
     */
    public async put(credentials: ICredentials, claim: IKillClaim): Promise<IReport<IKillClaim>> {
        console.log("Claiming", claim);
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
