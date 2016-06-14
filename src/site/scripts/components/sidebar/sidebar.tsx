/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { ILeader } from "../../../../shared/users";
import { ActivityBar } from "./activitybar";
import { Leaderboard } from "./leaderboard";

/**
 * Props for an ActivityBar component.
 */
export interface ISidebarState {
    /**
     * Displayed leaders.
     */
    leaders: ILeader[];

    /**
     * Displayed activity messages.
     */
    messages: string[];
}

/**
 * Component for a sidebar.
 * 
 * @param props   Props for an Sidebar component.
 * @returns The rendered compoment.
 */
export class Sidebar extends React.Component<ISidebarState, ISidebarState> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <section className="sidebar">
                <ActivityBar messages={this.props.messages} />
                <Leaderboard leaders={this.props.leaders} />
            </section>);
    }
}
