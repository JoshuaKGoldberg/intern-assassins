/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { Sdk } from "../../sdk/sdk";
import { ICredentials, CredentialKeys } from "../../../../shared/login";

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
export interface IAppAnonymousState {
    /**
     * Errors from invalid login credentials.
     */
    errors: string[];
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
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <form id="app" className="app-anonymous" onSubmit={(event: React.FormEvent) => this.handleSubmit(event)}>
                <h1>Would you like to play a game?</h1>

                <input ref="alias" type="text" placeholder="alias" />
                <input ref="nickname" type="text" placeholder="nickname" />
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
