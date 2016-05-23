/// <reference path="../../../../../typings/react/index.d.ts" />

import * as React from "react";
import { ActionButton } from "./actionbutton";

/**
 * 
 */
export interface IActionProps {
    /**
     * 
     */
    alive: boolean;

    /**
     * 
     */
    onDeath: () => void;

    /**
     * 
     */
    onKill: () => void;
}

/**
 * 
 */
export const Actions: React.StatelessComponent<IActionProps> = (props: IActionProps): JSX.Element => {
    if (!props.alive) {
        return <div className="actions actions-dead">You're dead, so unfortunately you can't do anything.</div>;
    }

    return (
        <div className="actions actions-alive">
            <ActionButton action={(): void => props.onKill()} text="Report a kill!" />
            <ActionButton action={(): void => props.onDeath()} text="Are you dead?" />
        </div>);
};
