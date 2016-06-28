/// <reference path="../../../../../typings/moment/index.d.ts" />
/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as Moment from "moment";
import * as React from "react";

/**
 * Props for a Countdown component.
 */
export interface ICountdownProps {
    /**
     * Text descriptor for underneath the countdown.
     */
    descriptor: string;

    /**
     * What time to countdown to, in milliseconds.
     */
    goalTime: number;

    /**
     * Completion callback for when the time is reached.
     */
    onComplete?: () => void;
}

/**
 * State for a Countdown component.
 */
interface ICountdownState {
    /**
     * Completion callback for when the time is reached.
     */
    onCompleteCalled?: boolean;

    /**
     * Timer for the update interval.
     */
    timer?: any;

    /**
     * How much time is left, in milliseconds.
     */
    timeRemaining?: number;
}

/**
 * Component for a sidebar round countdown.
 */
export class Countdown extends React.Component<ICountdownProps, ICountdownState> {
    /**
     * 
     */
    public componentDidMount(): void {
        this.setState({
            timer: setInterval((): void => this.timerInterval(), 1000),
            timeRemaining: this.props.goalTime - Date.now()
        });
    }

    /**
     * 
     */
    public componentWillUnmount(): void {
        clearTimeout(this.state.timer);
    }

    /**
     * 
     */
    public render(): JSX.Element {
        if (!this.state) {
            return <div className="countdown"></div>;
        }

        return (
            <div className="countdown">
                <h3>{this.renderCountdown(this.state.timeRemaining)}</h3>
                <h4>{this.props.descriptor}</h4>
            </div>);
    }

    /**
     * Renders a countdown timer.
     * 
     * @param remainingTime   How long, in milliseconds, is remaining.
     * @returns The rendered countdown timer string.
     */
    private renderCountdown(remainingTime: number): string {
        const duration: moment.Duration = Moment.duration(remainingTime);
        const days: number = duration.days();
        let timeDisplay: string;

        if (days > 0) {
            timeDisplay = [
                this.renderTimeString(days, "day"),
                this.renderTimeString(duration.hours(), "hour")
            ].join(" ");
        } else {
            timeDisplay = [
                this.renderTimeDigit(duration.hours()),
                this.renderTimeDigit(duration.minutes()),
                this.renderTimeDigit(duration.seconds())
            ].join(":");
        }

        return timeDisplay;
    }

    /**
     * Renders a time as a pluralized string.
     * 
     * @param amount   How much of the time measurement.
     * @param measurement   A time measurement, such as "day".
     * @returns The amount and measurement, pluralized.
     */
    private renderTimeString(amount: number, measurement: string): string {
        return amount === 1 ? `${amount} ${measurement}` : `${amount} ${measurement}s`;
    }

    /**
     * Renders a number as a digit of length 2.
     * 
     * @param amount   A number.
     * @returns The amount as a digit of length 2.
     */
    private renderTimeDigit(amount: number): string {
        return amount < 10 ? `0${amount}` : `${amount}`;
    }

    /**
     * 
     */
    private timerInterval(): any {
        const now: number = Date.now();
        const timeRemaining: number = this.props.goalTime - now;

        if (now <= 0) {
            clearInterval(this.state.timer);
            this.props.onComplete();
            this.setState({ onCompleteCalled: true });
        }

        this.setState({
            timer: this.state.timer,
            timeRemaining: timeRemaining
        });
    }
}
