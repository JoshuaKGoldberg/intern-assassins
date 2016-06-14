/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { ILeader } from "../../../../shared/users";

/**
 * Props for a Leaderboard component.
 */
export interface ILeaderboardProps {
    /**
     * Display leaders.
     */
    leaders: ILeader[];
}

/**
 * Component for a leaderboard.
 * 
 * @param props   Props for a Leaderboard component.
 * @returns The rendered compoment.
 */
export class Leaderboard extends React.Component<ILeaderboardProps, void> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <div className="leaderboard">
                {this.renderLeadersTable("alive", true)}
                {this.renderLeadersTable("dead", false)}
            </div>);
    }

    /**
     * Renders a container and table of some leaders.
     * 
     * @param title   A title above the table.
     * @param alive   Whether the leaders should be alive.
     * @returns The rendered container.
     */
    public renderLeadersTable(title: string, alive: boolean): JSX.Element {
        return (
            <div className="leaders-table-container">
                <h3>{title}</h3>
                <table>
                    {this.props.leaders
                        .filter((leader: ILeader): boolean => leader.alive === alive)
                        .map((leader: ILeader, i: number): JSX.Element => {
                            return (
                                <tr>
                                    <td className="leader-name">{leader.nickname}</td>
                                    <td className="leader-kills">{leader.kills}</td>
                                </tr>);
                        })}
                </table>
            </div>);
    }
};
