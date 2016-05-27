/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { IKillClaim } from "../../shared/kills";
import { IUser } from "../../shared/users";
import { ICredentials } from "../../shared/login";
import { ErrorCause, ServerError } from "../errors";
import { StorageTable } from "./storagetable";

/**
 * Mock database storage for kill claims.
 * 
 * @todo Use MongoDB...
 */
export class KillClaimsTable extends StorageTable<IReport<IKillClaim>> {
    /**
     * Past kills, ordered from oldest to newest.
     */
    private claims: IReport<IKillClaim>[] = [];

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
    public put(credentials: ICredentials, claim: IKillClaim): Promise<IReport<IKillClaim>> {
        let killer: IUser;
        let victim: IUser;

        return this.validateUserSubmission(credentials)
            .then(user => {
                // You can only claim a kill on yourself or your target
                if (user.alias !== claim.victim && user.alias !== claim.killer) {
                    throw new ServerError(ErrorCause.PermissionDenied);
                }

                return this.api.users.getMany(credentials, [claim.killer, claim.victim])
                    .then(users => {
                        [killer, victim] = [users[0].data, users[1].data];

                        if (!killer.alive) {
                            throw new ServerError(ErrorCause.UsersDead, killer.alias);
                        }

                        if (!victim.alive) {
                            throw new ServerError(ErrorCause.UsersDead, victim.alias);
                        }

                        return [killer, victim];
                    });
            })
            // Add the submission to the database
            .then((users) => {
                const report = this.wrapSubmission(credentials, claim);

                this.claims.push(report);

                return report;
            })
            // Update the corresponding users
            .then((report: IReport<IKillClaim>): Promise<IReport<IKillClaim>> => {
                // Only change death status when the victim says so
                if (killer.alias === victim.alias) {
                    victim.alive = false;
                } else {
                    killer.target = victim.target;
                }

                return this.api.users
                    .update({
                        data: killer,
                        reporter: killer.alias,
                        timestamp: Date.now()
                    })
                    .then(() => this.api.users.update({
                        data: victim,
                        reporter: victim.alias,
                        timestamp: Date.now()
                    }))
                    .then(() => this.api.fireReportCallback(report))
                    .then(() => report);
            });
    }
}
