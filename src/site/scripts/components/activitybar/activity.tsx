/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";

/**
 * 
 */
export interface IActivityProps {
    /**
     * 
     */
    text: string;
}

/**
 * 
 */
export interface IActivityState {
    // ...
}

/**
 * 
 */
export class Activity extends React.Component<IActivityProps, IActivityState> {
    /**
     * 
     */
    public render(): JSX.Element {
        console.log("Rendering in activity", this.props);
        return (
            <div className="activity">
                {this.props.text}
            </div>);
    }
}
