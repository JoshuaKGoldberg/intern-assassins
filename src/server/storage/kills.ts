/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { IKillClaim } from "../../shared/kills";
import { IPlayer } from "../../shared/players";
import { ErrorCause, ServerError } from "../errors";
import { StorageMember } from "./storage";

/**
 * Mock database storage for kill actions.
 * 
 * @todo Use MongoDB...
 */
export class KillStorage extends StorageMember<IKillClaim> {
    /**
     * Past kills, ordered from oldest to newest.
     */
    private claims: IReport<IKillClaim>[] = [];

    /**
     * @returns Past kills, ordered from oldest to newest.
     */
    public get(id: string): Promise<IReport<IKillClaim>> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * @param alias   Ids of kill claims.
     * @returns A promise for the kill claims with the ids.
     */
    public getMany(ids: string[]): Promise<IReport<IKillClaim>[]> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * @returns Past kills, ordered from oldest to newest.
     */
    public getAll(): Promise<IReport<IKillClaim>[]> {
        return new Promise((resolve, reject) => {
            resolve(this.claims);
        });
    }

    /**
     * Adds a new kill claim to the database.
     * 
     * @param report   A kill claim to add.
     * @returns A promise for the kill claim, if added successfully.
     */
    public put(report: IReport<IKillClaim>): Promise<IReport<IKillClaim>> {
        const killerAlias: string = report.data.killer;
        const victimAlias: string = report.data.victim;

        if (report.reporter !== killerAlias && report.reporter !== victimAlias) {
            throw new ServerError(ErrorCause.PermissionDenied);
        }

        let killer: IPlayer;
        let victim: IPlayer;

        return this.api.players.getMany([killerAlias, victimAlias])
            // Validation: make sure both players are alive, and the killer is targeting the right victim
            .then(reports => {
                [killer, victim] = [reports[0].data, reports[1].data];

                if (!killer.alive) {
                    throw new ServerError(ErrorCause.PlayersDead, killerAlias);
                }

                if (!victim.alive) {
                    throw new ServerError(ErrorCause.PlayersDead, victimAlias);
                }

                if (killer.target !== victimAlias && killer.alias !== victimAlias) {
                    throw new ServerError(ErrorCause.WrongTarget, victimAlias);
                }
            })
            // Add the claim to the datdabase
            .then(() => {
                const killClaimReport: IReport<IKillClaim> = {
                    data: {
                        killer: killer.alias,
                        victim: victim.alias
                    },
                    reporter: killer.alias,
                    timestamp: Date.now()
                };

                this.claims.push(killClaimReport);

                return killClaimReport;
            })
            // Update the corresponding players
            .then((killClaimReport: IReport<IKillClaim>): Promise<IReport<IKillClaim>> => {
                // Only change death status when the victim says so
                if (killer.alias === victim.alias) {
                    victim.alive = false;
                } else {
                    killer.target = victim.target;
                }

                return this.api.players
                    .update({
                        data: killer,
                        reporter: killer.alias,
                        timestamp: Date.now()
                    })
                    .then(() => this.api.players.update({
                        data: victim,
                        reporter: victim.alias,
                        timestamp: Date.now()
                    }))
                    .then(() => this.api.fireReportCallback(killClaimReport))
                    .then(() => killClaimReport);
            });
    }

    /**
     * Retrieves a unique id for a single player for a single-target submission.
     * 
     * @param submission   A submission targeting a single player.
     * @returns The target id (alias) from the submission.
     */
    public retrieveIdFromRequest(body): string {
        throw new ServerError(ErrorCause.NotImplemented);
    }
}
