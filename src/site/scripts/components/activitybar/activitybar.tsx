/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { Activity } from "./activity";

/**
 * Props for an ActivityBar component.
 */
export interface IActivityBarProps {
    /**
     * Display activity messages.
     */
    messages: string[];
}

/**
 * Stateless component for an activity bar.
 * 
 * @param props   Props for an ActivityBar component.
 * @returns The rendered compoment.
 */
export const ActivityBar: React.StatelessComponent<IActivityBarProps> = (props: IActivityBarProps): JSX.Element => {
    return (
        <section id="activity-bar">
            {props.messages.map(
                (message: string, i: number): JSX.Element => {
                    return <Activity key={i} message={message} />;
                })}
        </section>);
};
