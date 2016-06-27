"use strict";
import { IRound } from "../../shared/rounds";
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
     * @param rounds   Rounds to add to the database.
     * @returns A promise for adding the rounds.
     */
    public async initialize(rounds: IRound[]): Promise<void> {
        await this.collection.insertMany(rounds);
        this.rounds = rounds;
    }
}
