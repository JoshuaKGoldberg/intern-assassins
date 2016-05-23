/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/socket.io/index.d.ts" />

declare var io: SocketIOStatic;
import * as React from "react";
import { IReport } from "../../../../shared/actions";
import { IPlayer } from "../../../../shared/players";
import { ILoginValues } from "../../../../shared/login";
import { AppStorage, IPlayerStorage } from "../../storage/appstorage";
import { Sdk } from "../../sdk/sdk";
import { AppAnonymous } from "./appanonymous";
import { AppLoggedIn } from "./apploggedin";

/**
 * 
 */
export interface IAppProps {
    // ...
}

/**
 * 
 */
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

    /**
     * 
     */
    recentReports: IReport<any>[];
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
    private socket: SocketIO.Server;

    /**
     * 
     */
    public constructor(props?: IAppProps, context?: any) {
        super(props, context);
        this.storage = new AppStorage();
        this.sdk = new Sdk();
        this.state = {
            alias: this.storage.alias,
            passphrase: this.storage.passphrase,
            recentReports: []
        };

        if (this.state.alias && this.state.passphrase) {
            this.receivePlayerUpdate();
        }

        this.socket = io();
        this.socket.on("report", (report: IReport<any>): void => this.receiveReport(report));
    }

    /**
     * 
     */
    public render(): JSX.Element {
        if (this.state.alias && this.state.passphrase) {
            return (
                <AppLoggedIn
                    player={this.state.player}
                    recentReports={this.state.recentReports}
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
                passphrase: values.passphrase,
                recentReports: this.state.recentReports
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
                    player: report.data,
                    recentReports: this.state.recentReports
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

    /**
     * 
     */
    private receiveReport(reportRaw: string): void {
        const newReports: IReport<any>[] = this.state.recentReports.slice();
        newReports.push(JSON.parse(reportRaw));

        this.setState(
            {
                recentReports: newReports
            },
            (): void => {
                setTimeout(
                    (): void => this.removeReport(report),
                    5000);
            });
    }

    /**
     * 
     */
    private removeReport(report: IReport<any>): void {
        const newReports: IReport<any>[] = this.state.recentReports.filter(
            (recentReport: IReport<any>): boolean => {
                return recentReport !== report;
            });

        this.setState({
            recentReports: newReports
        });
    }
}
