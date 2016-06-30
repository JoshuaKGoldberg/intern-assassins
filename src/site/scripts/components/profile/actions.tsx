/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IRound } from "../../../../shared/rounds";
import { ActionButton } from "./actionbutton";

/**
 * Props for an Actions component.
 */
export interface IActionProps {
    /**
     * Whether the user is alive.
     */
    alive: boolean;

    /**
     * Handler for the user reporting their own death.
     */
    onDeath: () => void;

    /**
     * Handler for the user reporting they've scored a kill.
     */
    onKill: () => void;

    /**
     * Gameplay rounds.
     */
    rounds: IRound[];

    /**
     * Codename of the hunted victim.
     */
    target: string;
}

/**
 * Component for actionable profile buttons.
 */
export class Actions extends React.Component<IActionProps, void> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        if (!this.props.alive) {
            return (
                <div className="actions actions-dead">
                    <em>You're dead, so unfortunately you can't do anything.</em>
                </div>);
        }

        return (
            <div className="actions actions-alive">
                <ActionButton action={(): void => this.props.onKill()} text="Report a kill!" />
                <ActionButton action={(): void => this.props.onDeath()} text="Are you dead?" />
            </div>);
    }
};
