/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
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
}

/**
 * Component for actionable profile buttons.
 */
export const Actions: React.StatelessComponent<IActionProps> = (props: IActionProps): JSX.Element => {
    if (!props.alive) {
        return (
            <div className="actions actions-dead">
                <em>You're dead, so unfortunately you can't do anything.</em>
            </div>);
    }

    return (
        <div className="actions actions-alive">
            <ActionButton action={(): void => props.onKill()} text="Report a kill!" />
            <ActionButton action={(): void => props.onDeath()} text="Are you dead?" />
        </div>);
};
