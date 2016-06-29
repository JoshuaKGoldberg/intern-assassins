/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { Sdk } from "../../sdk/sdk";
import { ICredentials, CredentialKeys } from "../../../../shared/login";
import { IRound } from "../../../../shared/rounds";
import { Countdown } from "../sidebar/countdown";

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
            .then((rounds: IRound[]) => {
                this.setState({
                    errors: [],
                    startTime: rounds[0].start
                });
            })
            .catch((error: Error): void => {
                this.setState({
                    errors: [error.message || JSON.stringify(error)]
                });
            });
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
            return (
                <div id="app" className="app-countdown">
                    <Countdown
                        descriptor="until the killing begins"
                        onComplete={(): void => this.forceUpdate()}
                        goalTime={this.state.startTime} />
                </div>);
        }

        return this.renderLoginScreen();
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
}
