/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { Activity } from "./activity";

export interface IActivityBarProps {
    /**
     * 
     */
    messages: string[];
}

export const ActivityBar: React.StatelessComponent<IActivityBarProps> = (props: IActivityBarProps): JSX.Element => {
    return (
        <section id="activity-bar">
            {props.messages.map(
                (message: string, i: number): JSX.Element => {
                    return <Activity key={i} message={message} />;
                })}
        </section>);
};
