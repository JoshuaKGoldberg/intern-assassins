/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { Sdk } from "../../sdk/sdk";
import { ICredentials, CredentialKeys } from "../../../../shared/login";

/**
 * 
 */
export interface IAppAnonymousProps {
    /**
     * 
     */
    sdk: Sdk;

    /**
     * 
     */
    onLogin(values: ICredentials): void;
}

/**
 * 
 */
export interface IAppAnonymousState {
    errors: string[];
}

/**
 * 
 */
export class AppAnonymous extends React.Component<IAppAnonymousProps, IAppAnonymousState> {
    /**
     * 
     */
    public state: IAppAnonymousState = {
        errors: []
    };

    /**
     * 
     */
    public render(): JSX.Element {
        return (
            <form id="app" className="app-anonymous" onSubmit={(event: React.FormEvent) => this.handleEventSubmit(event)}>
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
     * 
     */
    private renderErrors(): JSX.Element[] {
        return this.state.errors.map((error: string, i: number): JSX.Element => {
            return <div key={error} className="error">{error}</div>;
        });
    }

    /**
     * 
     */
    private handleEventSubmit(event: React.FormEvent): void {
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

        console.log("Values", values);

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
