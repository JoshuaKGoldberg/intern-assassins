/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { INotification } from "../../../../shared/notifications";
import { ILeader } from "../../../../shared/users";
import { IRound } from "../../../../shared/rounds";
import { ActivityBoard } from "./activityboard";
import { Countdown } from "./countdown";
import { Leaderboard } from "./leaderboard";

/**
 * Props for an ActivityBar component.
 */
export interface ISidebarProps {
    /**
     * Displayed leaders.
     */
    leaders: ILeader[];

    /**
     * Displayed activity messages.
     */
    notifications: INotification[];

    /**
     * Gameplay rounds.
     */
    rounds: IRound[];
}

/**
 * State for a Sidebar component.
 */
interface ISidebarState {
    /**
     * Which part of the sidebar is being shown.
     */
    selected: SidebarSelection;
}

/**
 * Which part of the sidebar is being shown.
 */
enum SidebarSelection {
    ActivityBoard,
    Leaderboard
}

/**
 * Component for a sidebar.
 * 
 * @param props   Props for an Sidebar component.
 * @returns The rendered compoment.
 */
export class Sidebar extends React.Component<ISidebarProps, ISidebarState> {
    /**
     * State for the component.
     */
    public state: ISidebarState = {
        selected: SidebarSelection.ActivityBoard
    };

    /**
     * Sidebar selections keyed to render methods.
     */
    private renderers: { [i: number]: () => JSX.Element } = {
        [SidebarSelection.ActivityBoard]: (): JSX.Element => <ActivityBoard notifications={this.props.notifications} />,
        [SidebarSelection.Leaderboard]: (): JSX.Element => <Leaderboard leaders={this.props.leaders} />
    };

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <section className="sidebar">
                {this.renderSelectionChangers()}
                {this.renderers[this.state.selected]()}
                {this.renderCountdown()}
            </section>);
    }

    /**
     * Renders the countdown timer to the end of the round.
     * 
     * @returns The rendered countdown timer.
     */
    public renderCountdown(): JSX.Element {
        const currentRound: IRound = this.getCurrentRound();
        if (!currentRound) {
            return undefined;
        }

        return (
            <Countdown
                descriptor="left in the round"
                goalTime={currentRound.end}
                onComplete={(): void => this.forceUpdate()} />);
    }

    /**
     * Renders the container of selection changer buttons.
     * 
     * @returns The rendered container.
     */
    private renderSelectionChangers(): JSX.Element {
        return (
            <div className="selection-changers">
                {this.renderSelectionChanger(SidebarSelection.ActivityBoard, "Activity")}
                {this.renderSelectionChanger(SidebarSelection.Leaderboard, "Leaders")}
            </div>);
    }

    /**
     * Renders an individual selection changer button.
     * 
     * @param selection   Which selection the button activates.
     * @param value   UI text value of the button.
     * @returns The rendered button.
     */
    private renderSelectionChanger(selection: SidebarSelection, value: string): JSX.Element {
        let className: string = "selection-changer dark";

        if (selection === this.state.selected) {
            className += " active";
        }

        return (
            <input
                className={className}
                onClick={(): void => this.setSelection(selection)}
                type="button"
                value={value} />);
    }

    /**
     * Sets the state's selection.
     * 
     * @param selected   The new selection.
     */
    private setSelection(selected: SidebarSelection): void {
        this.setState({ selected });
    }

    /**
     * Determines which round is currently in play.
     * 
     * @returns The current round, if it exists.
     */
    private getCurrentRound(): IRound {
        // Case: no rounds yet
        if (!this.props.rounds) {
            return undefined;
        }

        const now: number = Date.now();

        // Case: inside a round
        console.log("Rounds", this.props.rounds, now);
        for (const round of this.props.rounds) {
            if (round.start <= now && round.end > now) {
                return round;
            }
        }

        // Case: between rounds
        return undefined;
    }
}
