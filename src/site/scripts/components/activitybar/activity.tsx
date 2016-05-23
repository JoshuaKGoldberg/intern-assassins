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
    message: string;
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
        return (
            <div className="activity">
                {this.props.message}
            </div>);
    }
}
