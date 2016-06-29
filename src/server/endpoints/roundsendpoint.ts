/// <reference path="../../../typings/moment/index.d.ts" />

"use strict";
import * as Moment from "moment";
import { IRawRound, IRound } from "../../shared/rounds";
import { ICredentials } from "../../shared/login";
import { Endpoint } from "./endpoint";

/**
 * Endpoint for gameplay rounds.
 */
export class RoundsEndpoint extends Endpoint<IRound> {
    /**
     * In-memory cache of the never-changing rounds.
     */
    public /* readonly */ rounds: IRound[];

    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "rounds";
    }

    /**
     * Retrieves rounds.
     * 
     * @param credentials   Login values (ignored).
     * @returns All rounds.
     */
    public async get(credentials: ICredentials, query: any): Promise<IRound[]> {
        return this.rounds;
    }

    /**
     * Adds gameplay rounds to the database.
     * 
     * @param rawRounds   Raw rounds from settings.
     * @returns A promise for the sanitized and added rounds.
     */
    public async initialize(rawRounds: IRawRound[]): Promise<IRound[]> {
        const rounds: IRound[] = this.sanitizeRounds(rawRounds);

        await this.collection.insertMany(rounds);
        this.rounds = rounds;
        return rounds;
    }

    /**
     * Sanitizes rounds by formatting their dates nicely.
     * 
     * @param rawRounds   Raw rounds from settings.
     * @returns Sanitized equivalents of the rounds.
     */
    private sanitizeRounds(rawRounds: IRawRound[]): IRound[] {
        return rawRounds.map((rawRound: IRawRound): IRound => {
            return {
                end: this.formatRoundTime(rawRound.end),
                start: this.formatRoundTime(rawRound.start)
            };
        });
    }

    /**
     * Formats a timestamp in "LLLL" time.
     * 
     * @param rawTime   A raw timestamp.
     * @returns The timestamp formatted.
     */
    private formatRoundTime(rawTime: string): number {
        return +Moment(rawTime, "LLLL").toDate();
    }
}
