/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

import * as React from "react";

/**
 * 
 */
export interface IActivityProps {
    // ...
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
                Something happened to someone.
            </div>);
    }
}
