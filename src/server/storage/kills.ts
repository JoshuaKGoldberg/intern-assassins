/// <reference path="../../../typings/all.d.ts" />

import { IReport } from "../../shared/actions";
import { IKillClaim } from "../../shared/kills";
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

        return this.api.players.getMany([killerAlias, victimAlias])
            .then(reports => {
                const [killer, victim] = [reports[0].data, reports[1].data];

                if (!killer.alive) {
                    throw new ServerError(ErrorCause.PlayerIsDead, killerAlias);
                }

                if (!victim.alive) {
                    throw new ServerError(ErrorCause.PlayerIsDead, victimAlias);
                }

                if (killer.target !== victimAlias) {
                    throw new ServerError(ErrorCause.WrongTarget, victimAlias);
                }

                return reports;
            })
            .then((reports) => {
                const [killer, victim] = reports;

                victim.data.alive = false;
                killer.data.target = victim.data.target;

                this.api.players.update(killer);
                this.api.players.update(victim);

                return new Promise<IReport<IKillClaim>>(undefined);
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
