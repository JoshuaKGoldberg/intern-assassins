/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as Moment from "moment";
import * as React from "react";

/**
 * Props for a KillCountdown component.
 */
export interface IKillCountdownProps {
    /**
     * Codename of the hunted victim.
     */
    target: string;

    /**
     * When the victim must be killed.
     */
    time: number;
}

/**
 * Displays how long the user has until they need to kill.
 */
export class KillCountdown extends React.Component<IKillCountdownProps, void> {
    /**
     * Interval for updating the display.
     */
    private interval: any;

    /**
     * Handler for the component mounting.
     */
    public componentDidMount(): void {
        this.interval = setInterval(
            (): void => this.forceUpdate(),
            1000);
    }

    /**
     * Handler for the component unmounting.
     */
    public componentWillUnmount(): void {
        clearInterval(this.interval);
    }

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        if (!this.props.time) {
            return (
                <div className="round-countdown">
                    You're all set for time.
                </div>);
        }

        return (
            <div className="round-countdown">
                You have <strong>{Moment(this.props.time).fromNow()}</strong>
                to kill {this.props.target} before you'll be automatically killed.
            </div>);
    }
}
