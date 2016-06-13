/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { IKillClaim } from "../../shared/kills";
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

        // List non-admin users as leaders, keyed by alias
        (await this.api.endpoints.users.getAll())
            .filter((report: IReport<IUser>): boolean => !report.data.admin)
            .forEach((report: IReport<IUser>): void => {
                leaders[report.data.alias] = {
                    alive: report.data.alive,
                    kills: 0,
                    nickname: report.data.nickname
                };
            });

        // Count claims by killers of victims that are confirmed dead
        (await this.api.endpoints.kills.getAll())
            .map((report: IReport<IKillClaim>): IKillClaim => report.data)
            .filter((claim: IKillClaim): boolean => {
                return claim.killer !== claim.victim && !leaders[claim.victim].alive;
            })
            .forEach((killClaim: IKillClaim): void => {
                leaders[killClaim.killer].kills += 1;
            });

        // Sort leaders by kills (descending), then by nickname (ascending).
        return Object.keys(leaders)
            .map((key: string): ILeader => leaders[key])
            .sort((a: ILeader, b: ILeader): number => {
                if (a.kills !== b.kills) {
                    return b.kills - a.kills;
                }

                return a.nickname < b.nickname ? -1 : 1;
            });
    }
}
