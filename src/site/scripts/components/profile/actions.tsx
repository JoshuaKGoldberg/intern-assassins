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
     * The user's target
     */
    target: string;

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
    let killButton  = `I killed ${props.target}!`;
    if (!props.alive) {
        return (
            <div className="actions actions-dead">
                <em>You're dead, so unfortunately you can't do anything.</em>
            </div>);
    }

    return (
        <div className="actions actions-alive">
            <ActionButton action={(): void => props.onKill()} text={killButton} confirmationText="Are you sure you want to report a kill?"/>
            <ActionButton action={(): void => props.onDeath()} text="I'm dead!" confirmationText="Are you sure you want to report yourself as dead?"/>
        </div>);
};
