/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";

/**
 * Props for an InfoDisplay component.
 */
export interface IInfoDisplayProps {
    /**
     * Whether the info is editable.
     * 
     * @todo Implement this?
     */
    editable?: boolean;

    /**
     * Name of the info, such as "alias".
     */
    info: string;

    /**
     * Displayed value of the info, such as "jogol".
     */
    display: string;
}

/**
 * State for an InfoDisplay component.
 */
export interface IInfoDisplayState {
    /**
     * Whether the component is being edited.
     */
    editing: boolean;
}

/**
 * Component for an editable displayed piece of information.
 */
export class InfoDisplay extends React.Component<IInfoDisplayProps, IInfoDisplayState> {
    /**
     * State of the component.
     */
    public state: IInfoDisplayState = {
        editing: false
    };

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <div className="info-display">
                <span>Your </span>
                <span>{this.props.info} </span>
                <span>is </span>
                <strong>{this.props.display}</strong>.
            </div>);
    }
}
