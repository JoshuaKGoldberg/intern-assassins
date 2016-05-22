/// <reference path="../../../typings/all.d.ts" />

import { IReport, ISubmission } from "../../shared/actions";
import { IPlayer } from "../../shared/players";
import { ErrorCause, ServerError } from "../errors";
import { StorageMember } from "./storage";

/**
 * Mock database storage for players.
 * 
 * @todo Use MongoDB...
 */
export class PlayerStorage extends StorageMember<IPlayer> {
    /**
     * All known players.
     */
    public /* readonly */ players: IReport<IPlayer>[] = [];

    /**
     * @param alias   Alias of a player.
     * @returns A promise for the player with the alias.
     */
    public get(alias: string): Promise<IReport<IPlayer>> {
        return new Promise((resolve, reject) => {
            const player = this.players.find(report => report.data.alias === alias);

            if (player) {
                resolve(player);
            } else {
                reject(new ServerError(ErrorCause.PlayerDoesNotExist, alias));
            }
        });
    }

    /**
     * @param alias   Aliases of players.
     * @returns A promise for the players with the aliases.
     */
    public getMany(aliases: string[]): Promise<IReport<IPlayer>[]> {
        let unfound: string[];
        const reports: IReport<IPlayer>[] = aliases.map(
            (alias: string): IReport<IPlayer> => {
                const playerReport: IReport<IPlayer> = this.players.find(
                    report => report.data.alias === alias);

                if (!playerReport) {
                    (unfound || (unfound = [])).push(alias);
                }

                return playerReport;
            });

        return new Promise((resolve, reject) => {
            if (unfound.length > 0) {
                reject(new ServerError(ErrorCause.PlayersDoNotExist, unfound));
            } else {
                resolve(reports);
            }
        });
    }

    /**
     * @returns A promise for all players.
     */
    public getAll(): Promise<IReport<IPlayer>[]> {
        return new Promise((resolve, reject) => {
            resolve(this.players);
        });
    }

    /**
     * Adds a new player to the database.
     * 
     * @param report   A player to add.
     * @returns A promise for the player, if added successfully.
     */
    public put(report: IReport<IPlayer>): Promise<IReport<IPlayer>> {
        return this.get(report.data.alias)
            .then(ServerError.inPromise(ErrorCause.PlayerAlreadyExists, report.data.alias))
            .catch((error: ServerError) => {
                if (error.cause !== ErrorCause.PlayerDoesNotExist) {
                    throw error;
                }

                this.players.push(report);
                return report;
            });
    }

    /**
     * Retrieves a unique alias for a player.
     * 
     * @param submission   A submission targeting a player.
     * @returns The target id (alias) from the submission.
     */
    public retrieveIdFromRequest(submission: ISubmission<IPlayer>): string {
        return submission.data.alias;
    }

    /**
     * 
     */
    public update(report: IReport<IPlayer>): Promise<void> {
        throw new ServerError(ErrorCause.NotImplemented);
    }
}
