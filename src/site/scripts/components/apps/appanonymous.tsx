/// <reference path="../../../../../typings/moment/index.d.ts" />
/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as Moment from "moment";
import * as React from "react";
import { Sdk } from "../../sdk/sdk";
import { ICredentials, CredentialKeys } from "../../../../shared/login";
import { IRound } from "../../../../shared/rounds";

/**
 * Props for an AppAnonymous component.
 */
export interface IAppAnonymousProps {
    /**
     * Wrapper around the server API.
     */
    sdk: Sdk;

    /**
     * Handler for a successful login.
     * 
     * @param values   User login credentials.
     */
    onLogin(values: ICredentials): void;
}

/**
 * State for an AppAnonymous component.
 */
interface IAppAnonymousState {
    /**
     * Errors from invalid login credentials.
     */
    errors: string[];

    /**
     * Time when the first round starts, if known.
     */
    startTime?: number;
}

/**
 * Application component for an anonymous user.
 */
export class AppAnonymous extends React.Component<IAppAnonymousProps, IAppAnonymousState> {
    /**
     * State for the component.
     */
    public state: IAppAnonymousState = {
        errors: []
    };

    /**
     * Invoked once after the initial rendering occurs. Requests rounds from the SDK.
     */
    public componentDidMount(): void {
        this.props.sdk.getRounds()
            .then((rounds: IRound[]) => this.startCountdown(rounds[0]))
            .catch((error: Error) => this.setState({
                errors: [error.message || JSON.stringify(error)]
            }));
    }

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        if (!this.state.startTime) {
            return <div>Loading...</div>;
        }

        if (this.state.startTime > Date.now()) {
            return this.renderCountdown(this.state.startTime - Date.now());
        }

        return this.renderLoginScreen();
    }

    /**
     * Renders a countdown timer until the first round.
     * 
     * @param remainingTime   How long, in milliseconds, until the first round.
     * @returns The rendered countdown timer.
     */
    private renderCountdown(remainingTime: number): JSX.Element {
        const duration: moment.Duration = Moment.duration(remainingTime);
        const days: number = duration.days();
        let descriptor: string;

        if (days > 0) {
            descriptor = [
                this.renderTimeString(days, "day"),
                this.renderTimeString(duration.hours(), "hour")
            ].join(" ");
        } else {
            descriptor = [
                this.renderTimeDigit(duration.hours()),
                this.renderTimeDigit(duration.minutes()),
                this.renderTimeDigit(duration.seconds())
            ].join(":");
        }

        return (
            <div id="app" className="app-countdown">
                <h1>{descriptor}</h1>
                <h3>until the killing begins</h3>
            </div>);
    }

    /**
     * Renders a login screen for anonymous users.
     * 
     * @returns The rendered login screen.
     */
    public renderLoginScreen(): JSX.Element {
        return (
            <form id="app" className="app-anonymous" onSubmit={(event: React.FormEvent) => this.handleSubmit(event)}>
                <h1>Would you like to play a game?</h1>

                <input ref="alias" type="text" placeholder="alias" />
                <input ref="codename" type="text" placeholder="codename" />
                <input ref="passphrase" type="password" placeholder="passphrase" />

                <input type="submit" value="submit" />
                <div className="errors">
                    {this.renderErrors()}
                </div>
            </form>);
    }

    /**
     * Renders any errors.
     * 
     * @returns The rendered errors.
     */
    private renderErrors(): JSX.Element[] {
        return this.state.errors.map((error: string, i: number): JSX.Element => {
            return <div key={error} className="error">{error}</div>;
        });
    }

    /**
     * Handles the user submitting login credentials.
     * 
     * @param event   The triggering event.
     */
    private handleSubmit(event: React.FormEvent): void {
        event.preventDefault();
        event.stopPropagation();

        const values: ICredentials = {} as any;
        const errors: string[] = [];

        CredentialKeys
            .forEach((refKey: string): void => {
                const value: string = (this.refs[refKey] as any).value;
                values[refKey] = value;

                if (value.length < 2) {
                    errors.push(`You forgot your ${refKey}!`);
                }
            });

        if (errors.length > 0) {
            this.setState({ errors });
            return;
        }

        this.props.sdk.login(values)
            .then((loggedIn: boolean): void => {
                if (loggedIn) {
                    this.props.onLogin(values);
                } else {
                    this.setState({
                        errors: ["Invalid login. Try again?"]
                    });
                }
            })
            .catch((error: string): void => {
                this.setState({
                    errors: [error]
                });
            });
    }

    /**
     * Starts a countdown timer for the first round.
     * 
     * @param round   The first round, if it is known.
     */
    private startCountdown(round: IRound): void {
        if (!round) {
            throw new Error("No first round retrieved from server.");
        }

        this.setState(
            {
                errors: [],
                startTime: round.start
            },
            (): void => {
                const updateTicks: any = setInterval(
                    (): void => {
                        const now: number = Date.now();
                        if (now >= this.state.startTime) {
                            clearInterval(updateTicks);
                        }

                        this.forceUpdate();
                    },
                    1000);
            });
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
}
