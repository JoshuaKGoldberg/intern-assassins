/// <reference path="../../../../../typings/moment/index.d.ts" />
/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as Moment from "moment";
import * as React from "react";
import { IClaim, IKill } from "../../../../shared/kills";
import { IUser } from "../../../../shared/users";

/**
 * Props for a KilClaimReports component.
 */
export interface IKillClaimReportsProps {
    /**
     * Any active kill claims related to the user.
     */
    claims: IClaim[];

    /**
     * Any recorded kills by the user.
     */
    kills: IKill[];

    /**
     * The user who made the claims.
     */
    user: IUser;
}

/**
 * Kills keyed by a description of the date they took place.
 */
interface IGroupedKills {
    [i: string]: IKill[];
}

/**
 * Component for a user's relevant kill claims.
 */
export class KillClaimReports extends React.Component<IKillClaimReportsProps, void> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        const pastKills: IGroupedKills = this.collectKills(this.props.kills);
        const pendingClaim: IClaim = this.collectPendingClaim(this.props.claims, this.props.kills);

        return (
            <div className="kill-claim-reports">
                {pendingClaim && this.renderPendingClaim(pendingClaim)}
                {this.props.user.alive && this.renderStatistics(this.props.kills)}
                {Object.keys(pastKills)
                    .map((key: string): JSX.Element => {
                        return (
                            <div className="kill-claim-group" key={key}>
                                <h3>{key}</h3>
                                {this.renderKillsGroup(pastKills[key])}
                            </div>);
                    })}
            </div>);
    }

    /**
     * Renders a statistics section for the user's kills.
     * 
     * @param kills   All kills related to the user.
     * @returns The rendered statistics section.
     */
    private renderStatistics(kills: IKill[]): JSX.Element {
        if (kills.length === 0) {
            return undefined;
        }

        const userKills: IKill[] = kills.filter((kill: IKill): boolean => {
            return kill.killer === this.props.user.alias;
        });
        const oldestKillDate: moment.Moment = Moment(userKills[0].timestamp);
        const newestKillDate: moment.Moment = Moment(userKills[userKills.length - 1].timestamp);
        const numberOfDays: number = oldestKillDate.diff(newestKillDate, "days") + 1;
        const descriptor: string = userKills.length === 1 ? "person" : "people";
        const daysPerKill: number = Math.round(numberOfDays / userKills.length);
        const daysDescriptor: string = daysPerKill === 1 ? "day" : "days";

        return (
            <div className="kill-statistics">
                <span>You've killed <strong>{userKills.length}</strong> {descriptor}.</span>
                <br />
                <span>That's {daysPerKill} {daysDescriptor} per kill.</span> 
            </div>);
    }

    /**
     * Renders a group of kills.
     * 
     * @param kills   Kill to render.
     * @returns The rendered kills.
     */
    private renderKillsGroup(kills: IKill[]): JSX.Element[] {
        return kills
            .sort((a: IKill, b: IKill): number => b.timestamp - a.timestamp)
            .map((kill: IKill, i: number): JSX.Element => this.renderKill(kill, i));
    }

    /**
     * Renders a single kill.
     * 
     * @param kill   The kill.
     * @param i   The kill's index in its container.
     * @returns The rendered kill.
     */
    private renderKill(kill: IKill, i: number): JSX.Element {
        const descriptor = kill.victim === this.props.user.alias
            ? `You were killed by ${kill.killer} :(`
            : `You killed ${kill.victim}`;

        return (
            <div className="kill-claim" key={i}>
                {descriptor}
            </div>);
    }

    /**
     * Groups kills by their date descriptors (rounded to the nearest day).
     * 
     * @param kills   Kills to collect.
     * @returns The kills, collected by their date descriptors.
     */
    private collectKills(kills: IKill[]): IGroupedKills {
        const collection: IGroupedKills = {};

        for (const kill of kills) {
            if (kill.killer === kill.victim) {
                continue;
            }

            const killDay: moment.Moment = Moment(kill.timestamp).startOf("day");
            const descriptor = killDay.calendar().split(" at ")[0];

            if (!collection.hasOwnProperty(descriptor)) {
                collection[descriptor] = [kill];
            } else {
                collection[descriptor].push(kill);
            }
        }

        return collection;
    }

    /**
     * Finds any pending claim against the user, if it exists.
     * 
     * @param claims   All claims related to the user.
     * @param kills   All kills related to the user.
     * @remarks This could be more performant, but at this scale it's unimportant.
     */
    private collectPendingClaim(claims: IClaim[], kills: IKill[]): IClaim {
        if (!this.props.user.alive) {
            return undefined;
        }

        // If the user's still alive, any claim against them should be pending
        return claims
            .filter((claim: IClaim): boolean => {
                return claim.victim === this.props.user.alias;
            })
            [0];
    }

    /**
     * Renders a pending claim.
     * 
     * @param claim   A kill claim.
     * @returns The rendered claim.
     */
    private renderPendingClaim(claim: IClaim) {
        return (
            <h3 className="pending-claim">
                Your killer says they've killed you! Can this be?
                <br />
                Either <a href="">file a dispute</a> or click 'Are you dead?'.
            </h3>);
    }
}
