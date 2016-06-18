/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";

/**
 * Props for an InfoDisplay component.
 */
export interface IInfoDisplayProps {
    /**
     * Displayed value of the info, such as "jogol".
     */
    display: string;

    /**
     * Name of the info, such as "alias".
     */
    info: string;

    /**
     * Whether the display needs a large text area.
     */
    large?: boolean;
}

/**
 * Stateless component for an displayed piece of information.
 * 
 * @param props   Properties of the component.
 * @returns The rendered component.
 */
export const InfoDisplay: React.StatelessComponent<IInfoDisplayProps> = (props: IInfoDisplayProps): JSX.Element => {
    let className: string = "info-display";

    if (props.large) {
        className += "info-display-large";
    }

    return (
        <div className={className}>
            <span>Your </span>
            <span>{props.info} </span>
            <span>is </span>
            <div className="display">{props.display}</div>.
        </div>);
};
