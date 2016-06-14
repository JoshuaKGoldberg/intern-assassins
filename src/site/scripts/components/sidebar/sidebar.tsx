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
export interface ISidebarProps {
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
    ActivityBar,
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
        selected: SidebarSelection.ActivityBar
    };

    /**
     * Sidebar selections keyed to render methods.
     */
    private renderers: { [i: number]: () => JSX.Element } = {
        [SidebarSelection.ActivityBar]: (): JSX.Element => <ActivityBar messages={this.props.messages} />,
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
            </section>);
    }

    /**
     * Renders the container of selection changer buttons.
     * 
     * @returns The rendered container.
     */
    private renderSelectionChangers(): JSX.Element {
        return (
            <div className="selection-changers">
                {this.renderSelectionChanger(SidebarSelection.ActivityBar, "Activity")}
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
}
