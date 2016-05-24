/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";

/**
 * Props for an Activity component.
 */
export interface IActivityProps {
    /**
     * Displayed activity message.
     */
    message: string;
}

/**
 * Stateless component for an activity message.
 * 
 * @param props   Props for an Activity component.
 * @returns The rendered compoment.
 */
export const Activity: React.StatelessComponent<IActivityProps> = (props: IActivityProps): JSX.Element => {
    return (
        <div className="activity">
            {props.message}
        </div>);
};
