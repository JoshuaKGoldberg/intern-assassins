/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { Sdk } from "../../sdk/sdk";
import { ILoginValues, LoginValueKeys } from "../../../../shared/login";

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
    onLogin(values: ILoginValues): void;
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
                {LoginValueKeys.map((refKey: string): JSX.Element => {
                    return <input key={refKey} ref={refKey} type="text" placeholder={refKey} />;
                })}
                <input type="submit" value="submit" />
                {this.state.errors.forEach((error: string): JSX.Element => {
                    return <div className="error">{error}</div>;
                })}
            </form>);
    }

    /**
     * 
     */
    private handleEventSubmit(event: React.FormEvent): void {
        event.preventDefault();
        event.stopPropagation();

        const values: ILoginValues = {} as any;
        const errors: string[] = [];

        LoginValueKeys
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
