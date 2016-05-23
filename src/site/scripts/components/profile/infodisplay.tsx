/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

import * as React from "react";

/**
 * 
 */
export interface IInfoDisplayProps {
    /**
     * 
     */
    editable?: boolean;

    /**
     * 
     */
    info: string;

    /**
     * 
     */
    display: string;
}

/**
 * 
 */
export interface IInfoDisplayState {
    /**
     * 
     */
    editing: boolean;
}

/**
 * 
 */
export class InfoDisplay extends React.Component<IInfoDisplayProps, IInfoDisplayState> {
    /**
     * 
     */
    public state: IInfoDisplayState = {
        editing: false
    };

    /**
     * 
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
