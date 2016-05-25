/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { ICredentials } from "../../shared/login";
import { IPlayer } from "../../shared/players";
import { ErrorCause, ServerError } from "../errors";
import { StorageTable } from "./storagetable";

/**
 * Mock database storage for players.
 * 
 * @todo Use MongoDB...
 */
export class PlayersTable extends StorageTable<IReport<IPlayer>> {
    /**
     * All known players.
     */
    private /* readonly */ players: IReport<IPlayer>[] = [
        {
            data: {
                alias: "jogol",
                alive: true,
                nickname: "Joshypoo",
                passphrase: "pineapple",
                target: "kkeer"
            },
            reporter: "jogol",
            timestamp: 1234567
        },
        {
            data: {
                alias: "kkeer",
                alive: true,
                nickname: "KK",
                passphrase: "pineapple",
                target: "cgong"
            },
            reporter: "kkeer",
            timestamp: 1234567
        },
        {
            data: {
                alias: "cgong",
                alive: true,
                nickname: "CC",
                passphrase: "pineapple",
                target: "satyan"
            },
            reporter: "cgong",
            timestamp: 1234567
        },
        {
            data: {
                alias: "satyan",
                alive: true,
                nickname: "Bae",
                passphrase: "pineapple",
                target: "jogol"
            },
            reporter: "satyan",
            timestamp: 1234567
        }
    ];

    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "players";
    }

    /**
     * Retrieves a player.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Alias of a player.
     * @returns A promise for the player with the alias.
     */
    public get(credentials: ICredentials): Promise<IReport<IPlayer>> {
        const player = this.players.find(report => report.data.alias === credentials.alias);

        if (!player) {
            throw new ServerError(ErrorCause.PlayersDoNotExist, credentials.alias);
        }

        if (
            player.data.nickname !== credentials.nickname
            || player.data.passphrase !== credentials.passphrase) {
            throw new ServerError(ErrorCause.IncorrectCredentials);
        }

        return Promise.resolve(player);
    }

    /**
     * Retrieves multiple players.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Aliases of players.
     * @returns A promise for the players with the aliases.
     */
    public getMany(credentials: ICredentials, aliases: string[]): Promise<IReport<IPlayer>[]> {
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
            if (unfound && unfound.length > 0) {
                reject(new ServerError(ErrorCause.PlayersDoNotExist, unfound));
            } else {
                resolve(reports);
            }
        });
    }

    /**
     * Retrieves a unique alias for a player.
     * 
     * @param submission   A submission targeting a player.
     * @returns The target id (alias) from the submission.
     */
    public retrieveIdFromRequest(submission: any): string {
        return submission.alias;
    }

    /**
     * Updates a player's information.
     * 
     * @param report   Updated information for a player.
     * @returns A promise for when the player is updated.
     */
    public update(report: IReport<IPlayer>): Promise<void> {
        const index = this.players.findIndex(
            (checkingReport: IReport<IPlayer>): boolean => {
                return checkingReport.data.alias === report.data.alias;
            });

        this.players.splice(index, 1);
        this.players.push(report);

        return Promise.resolve();
    }
}
