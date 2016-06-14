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

        // List non-admin users as leaders, keyed by alias
        users
            .filter((user: IUser): boolean => !user.admin)
            .forEach((user: IUser): void => {
                leaders[user.alias] = {
                    alive: user.alive,
                    kills: user.kills,
                    nickname: user.nickname
                };
            });

        // Sort leaders by kills (descending), then by nickname (ascending).
        const result = Object.keys(leaders)
            .map((key: string): ILeader => leaders[key])
            .sort((a: ILeader, b: ILeader): number => {
                if (a.kills !== b.kills) {
                    return b.kills - a.kills;
                }

                return a.nickname < b.nickname ? -1 : 1;
            });

        return result;
    }
}
