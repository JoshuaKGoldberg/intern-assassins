/// <reference path="../../../../../typings/react/index.d.ts" />

import * as React from "react";
import { IReport } from "../../../../shared/actions";
import { IPlayer } from "../../../../shared/players";
import { ILoginValues } from "../../../../shared/login";
import { AppStorage, IPlayerStorage } from "../../storage/appstorage";
import { Sdk } from "../../sdk/sdk";
import { AppAnonymous } from "./appanonymous";
import { AppLoggedIn } from "./apploggedin";

export interface IAppProps {
    // ...
}

export interface IAppState {
    /**
     * 
     */
    alias?: string;

    /**
     * 
     */
    passphrase?: string;

    /**
     * 
     */
    player?: IPlayer;
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
            alias: this.storage.alias,
            passphrase: this.storage.passphrase
        };

        if (this.state.alias && this.state.passphrase) {
            this.receivePlayerUpdate();
        }
    }

    /**
     * 
     */
    public render(): JSX.Element {
        if (this.state.alias && this.state.passphrase) {
            return (
                <AppLoggedIn
                    player={this.state.player}
                    reportUpdate={(): void => this.receivePlayerUpdate()}
                    sdk={this.sdk}
                />);
        } else {
            return (
                <AppAnonymous
                    onLogin={(values: ILoginValues) => this.receiveLoginValues(values)}
                    sdk={this.sdk}
                />);
        }
    }

    /**
     * 
     */
    private receiveLoginValues(values: ILoginValues): void {
        this.storage.alias = values.alias;
        this.storage.passphrase = values.passphrase;
        this.setState(
            {
                alias: values.alias,
                passphrase: values.passphrase
            },
            (): void => this.populatePlayer(values));
    }

    /**
     * 
     */
    private populatePlayer(values: IPlayerStorage): void {
        this.sdk.getPlayer(values.alias, values.passphrase)
            .then((report: IReport<IPlayer>): void => {
                this.setState({
                    alias: this.state.alias,
                    passphrase: this.state.passphrase,
                    player: report.data
                });
            });
    }

    /**
     * 
     */
    private receivePlayerUpdate(): void {
        this.populatePlayer({
            alias: this.state.alias,
            passphrase: this.state.passphrase
        });
    }
}
