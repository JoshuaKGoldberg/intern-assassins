/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { ILeader, IUser } from "../../shared/users";
import { Endpoint } from "./endpoint";

/**
 * Endpoint for retrieving leading users.
 */
export class LeadersEndpoint extends Endpoint<ILeader[]> {
    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "leaders";
    }

    /**
     * Retrieves leader information, sorted by descending number of kills.
     * 
     * @param credentials   Login values for authentication.
     * @returns A promise for leader information.
     */
    public async get(): Promise<ILeader[]> {
        const leaders: { [i: string]: ILeader } = {};
        const users: IUser[] = await this.api.endpoints.users.getAll();

        // Leaders are non-admin users with kills, sorted by kills (descending) then codename
        return users
            .filter((user: IUser): boolean => !user.admin && user.kills > 0)
            .map((user: IUser): ILeader => {
                return {
                    alive: user.alive,
                    kills: user.kills,
                    codename: user.codename
                };
            })
            .sort((a: ILeader, b: ILeader): number => {
                if (a.kills !== b.kills) {
                    return b.kills - a.kills;
                }

                return a.codename < b.codename ? -1 : 1;
            });
    }
}
