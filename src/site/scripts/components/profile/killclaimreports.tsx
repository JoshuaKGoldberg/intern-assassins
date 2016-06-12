/// <reference path="../../../../../typings/moment/index.d.ts" />
/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import * as moment from "moment";
import { IReport } from "../../../../shared/actions";
import { IKillClaim } from "../../../../shared/kills";

/**
 * Props for a KilClaimReports component.
 */
export interface IKillClaimReportsProps {
    /**
     * A user's relevant kill claim reports.
     */
    reports: IReport<IKillClaim>[];
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
        return (
            <div className="kill-claim-reports">
                {this.props.reports.map(
                    (report: IReport<IKillClaim>, i: number): JSX.Element => {
                        return report.data.killer
                            ? this.renderKillerReport(report, i)
                            : this.renderVictimReport(report, i);
                    })}
            </div>);
    }

    /**
     * Renders a report where the user is the killer.
     * 
     * @param report   A kill claim report.
     * @param i   Which index number this is.
     * @returns The rendered report.
     */
    private renderKillerReport(report: IReport<IKillClaim>, i: number): JSX.Element {
        const fromNow: string = moment(report.timestamp).fromNow();
        const victim: string = report.data.victim;

        return (
            <div className="kill-claim-report killer-report" key={i}>
                You reported killing {victim} {fromNow}.
            </div>);
    }

    /**
     * Renders a report where the user is the victim.
     * 
     * @param report   A kill claim report.
     * @param i   Which index number this is.
     * @returns The rendered report.
     */
    private renderVictimReport(report: IReport<IKillClaim>, i: number): JSX.Element {
        const fromNow: string = moment(report.timestamp).fromNow();

        return (
            <div className="kill-claim-report victim-report" key={i}>
                Your killer reported killing you {fromNow}!
            </div>);
    }
}
