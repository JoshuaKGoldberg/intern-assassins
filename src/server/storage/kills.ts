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
                    throw new ServerError(ErrorCause.PlayerIsDead, killer.alias);
                }

                if (!killer.alive) {
                    throw new ServerError(ErrorCause.PlayerIsDead, victim.alias);
                }

                return [killer, victim];
            })
            .then((reports) => {
                const [killer, victim] = reports;

                console.log("Todo: execute the kill", killer, victim);

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
