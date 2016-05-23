/// <reference path="../../../../../typings/react/index.d.ts" />

import * as React from "react";
import { AppStorage } from "../../storage/appstorage";
import { Sdk } from "../../sdk/sdk";
import { AppAnonymous } from "./appanonymous";
import { AppLoggedIn } from "./apploggedin";

export interface IAppProps {
    // ...
}

export interface IAppState {
    alias?: string;
}

export class App extends React.Component<IAppProps, IAppState> {
    /**
     * 
     */
    public state: IAppState;

    /**
     * 
     */
    private storage: AppStorage;

    /**
     * 
     */
    private sdk: Sdk;

    /**
     * 
     */
    public constructor(props?: IAppProps, context?: any) {
        super(props, context);
        this.storage = new AppStorage();
        this.sdk = new Sdk();
        this.state = {
            alias: this.storage.alias
        };
    }

    /**
     * 
     */
    public render(): JSX.Element {
        if (this.state.alias) {
            return (
                <AppLoggedIn
                    alias={this.state.alias}
                    sdk={this.sdk}
                />);
        } else {
            return (
                <AppAnonymous
                    onLogin={(alias: string) => this.receiveLoggedInAlias(alias)}
                    sdk={this.sdk}
                />);
        }
    }

    /**
     * 
     */
    private receiveLoggedInAlias(alias: string): void {
        this.storage.alias = alias;
        this.setState({ alias });
    }
}
