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
        return "login";
    }

    /**
     * Retrieves leader information, sorted by descending number of kills.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Alias of a user.
     * @returns A promise for the user with the alias.
     */
    public async get(): Promise<ILeader[]> {
        const userReports: IReport<IUser>[] = await this.api.endpoints.users.getAll();
        const killClaimReports: IReport<IKillClaim>[] = await this.api.endpoints.kills.getAll();

        const leaders: { [i: string]: ILeader } = {};
        userReports.forEach((report: IReport<IUser>): void => {
            leaders[report.data.alias] = {
                alive: report.data.alive,
                kills: 0,
                nickname: report.data.nickname
            };
        });

        // Count claims by killers of victims that are confirmed dead
        killClaimReports
            .map((report: IReport<IKillClaim>): IKillClaim => report.data)
            .filter((claim: IKillClaim): boolean => {
                return claim.killer !== claim.victim && !leaders[claim.victim].alive;
            })
            .forEach((killClaim: IKillClaim): void => {
                leaders[killClaim.killer].kills += 1;
            });

        return Object.keys(leaders)
            .map((key: string): ILeader => leaders[key])
            .sort((a: ILeader, b: ILeader): number => a.kills - b.kills);
    }
}
