/// <reference path="../../../typings/all.d.ts" />

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

        console.log("Putting -> getMany", [killerAlias, victimAlias]);
        return this.api.players.getMany([killerAlias, victimAlias])
            .then(reports => {
                [killer, victim] = [reports[0].data, reports[1].data];

                if (!killer.alive) {
                    throw new ServerError(ErrorCause.PlayersDead, killerAlias);
                }

                if (!victim.alive) {
                    throw new ServerError(ErrorCause.PlayersDead, victimAlias);
                }

                if (killer.target !== victimAlias) {
                    throw new ServerError(ErrorCause.WrongTarget, victimAlias);
                }

                killer.target = victim.target;
                victim.alive = false;
                victim.target = undefined;
            })
            .then(() => this.api.players.update({
                data: killer,
                reporter: killer.alias,
                timestamp: Date.now()
            }))
            .then(() => this.api.players.update({
                data: victim,
                reporter: victim.alias,
                timestamp: Date.now()
            }))
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
