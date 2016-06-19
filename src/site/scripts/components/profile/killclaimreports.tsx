/// <reference path="../../../../../typings/moment/index.d.ts" />
/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as Moment from "moment";
import * as React from "react";
import { IKillClaim } from "../../../../shared/kills";
import { IUser } from "../../../../shared/users";

/**
 * Props for a KilClaimReports component.
 */
export interface IKillClaimReportsProps {
    /**
     * A user's relevant kill claims.
     */
    killClaims: IKillClaim[];

    /**
     * The user who made the claims.
     */
    user: IUser;
}

/**
 * Kill claims keyed by a description of the date they took place.
 */
interface ICollectedKillClaims {
    [i: string]: IKillClaim[];
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
        const collectedReports: ICollectedKillClaims = this.collectKillClaims(this.props.killClaims);

        return (
            <div className="kill-claim-reports">
                {this.renderStatistics(this.props.killClaims)}
                {Object.keys(collectedReports)
                    .map((key: string): JSX.Element => {
                        return (
                            <div className="kill-claim-group" key={key}>
                                <h3>{key}</h3>
                                {this.renderKillClaimsGroup(collectedReports[key])}
                            </div>);
                    })}
            </div>);
    }

    /**
     * Renders a statistics section for kill claims.
     * 
     * @param killClaims   Kill claims to summarize.
     * @returns The rendered statistics section.
     */
    private renderStatistics(killClaims: IKillClaim[]): JSX.Element {
        const relevantClaims: IKillClaim[] = killClaims
            .filter((killClaim: IKillClaim): boolean => {
                return killClaim.killer === this.props.user.alias && killClaim.killer !== killClaim.victim;
            })
            .sort((a: IKillClaim, b: IKillClaim): number => b.timestamp - a.timestamp);

        if (relevantClaims.length === 0) {
            return <p className="kill-claim-statistics">You haven't killed anybody yet... Get cracking!</p>;
        }

        const oldestClaimDate: moment.Moment = Moment(relevantClaims[0].timestamp);
        const newestClaimDate: moment.Moment = Moment(relevantClaims[relevantClaims.length - 1].timestamp);
        const numberOfDays: number = oldestClaimDate.diff(newestClaimDate, "days") + 1;
        const killsDescriptor: string = relevantClaims.length === 1 ? "person" : "people";
        const daysPerKill: number = Math.round(numberOfDays / relevantClaims.length);
        const daysDescriptor: string = daysPerKill === 1 ? "day" : "days";

        return (
            <div className="kill-claim-statistics">
                <span>You've killed <strong>{relevantClaims.length}</strong> {killsDescriptor}.</span>
                <br />
                <span>That's {daysPerKill} {daysDescriptor} per kill.</span> 
            </div>);
    }

    /**
     * Renders a group of kill claims.
     * 
     * @param killClaims   Kill claims to render.
     * @returns The rendered kill claims.
     */
    private renderKillClaimsGroup(killClaims: IKillClaim[]): JSX.Element[] {
        return killClaims
            .sort((a: IKillClaim, b: IKillClaim): number => b.timestamp - a.timestamp)
            .map((killClaim: IKillClaim, i: number): JSX.Element => this.renderKillClaim(killClaim, i));
    }

    /**
     * Renders a single kill claim.
     * 
     * @param killClaim   The kill claim.
     * @param i   The claim's index in its container.
     * @returns The rendered kill claim.
     */
    private renderKillClaim(killClaim: IKillClaim, i: number): JSX.Element {
        const descriptor = killClaim.victim === this.props.user.alias
            ? `You were killed by ${killClaim.killer} :(`
            : `You killed ${killClaim.victim}`;

        return (
            <div className="kill-claim" key={i}>
                {descriptor}
            </div>);
    }

    /**
     * Groups kill claims by their date descriptors (rounded to the nearest day).
     * 
     * @param killClaims   Kill claims to collect.
     * @returns The kill claims, collected by their date descriptors.
     */
    private collectKillClaims(killClaims: IKillClaim[]): ICollectedKillClaims {
        const collection: ICollectedKillClaims = {};

        for (const killClaim of killClaims) {
            if (killClaim.killer === killClaim.victim) {
                continue;
            }

            const killDay: moment.Moment = Moment(killClaim.timestamp).startOf("day");
            const descriptor = killDay.calendar().split(" at ")[0];

            if (!collection.hasOwnProperty(descriptor)) {
                collection[descriptor] = [killClaim];
            } else {
                collection[descriptor].push(killClaim);
            }
        }

        return collection;
    }
}
