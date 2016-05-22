/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

import * as React from "react";

export interface IActivityBarProps {
    // ...
}

export interface IActivityBarState {
    // ...
}

export class ActivityBar extends React.Component<IActivityBarProps, IActivityBarState> {
    /**
     * 
     */
    public render(): JSX.Element {
        return (
            <section id="activity-bar">
                Events will show up here when they happen.
            </section>);
    }
}
