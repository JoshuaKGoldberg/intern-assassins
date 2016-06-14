/// <reference path="../../../../../typings/moment/index.d.ts" />
/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { IKillClaim } from "../../../../shared/kills";

/**
 * Props for a KilClaimReports component.
 */
export interface IKillClaimReportsProps {
    /**
     * A user's relevant kill claims.
     */
    killClaims: IKillClaim[];
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
                {this.props.killClaims.map(
                    (killClaim: IKillClaim, i: number): JSX.Element => {
                        return killClaim.killer
                            ? this.renderKillerReport(killClaim, i)
                            : this.renderVictimReport(killClaim, i);
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
    private renderKillerReport(report: IKillClaim, i: number): JSX.Element {
        const victim: string = report.victim;

        return (
            <div className="kill-claim-report killer-report" key={i}>
                You reported killing {victim}.
            </div>);
    }

    /**
     * Renders a report where the user is the victim.
     * 
     * @param report   A kill claim report.
     * @param i   Which index number this is.
     * @returns The rendered report.
     */
    private renderVictimReport(report: IKillClaim, i: number): JSX.Element {
        return (
            <div className="kill-claim-report victim-report" key={i}>
                Your killer has reported killing you.
            </div>);
    }
}
