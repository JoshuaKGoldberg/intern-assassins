/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

import * as React from "react";
import { Activity } from "./activity";

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
                <Activity key={0} />
                <Activity key={1} />
                <Activity key={2} />
                <Activity key={3} />
            </section>);
    }
}
