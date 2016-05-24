/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/socket.io/index.d.ts" />

"use strict";
declare var io: SocketIOStatic;
import * as React from "react";
import { IReport } from "../../../../shared/actions";
import { IPlayer } from "../../../../shared/players";
import { ILoginValues } from "../../../../shared/login";
import { AppStorage } from "../../storage/appstorage";
import { Sdk } from "../../sdk/sdk";
import { AppAnonymous } from "./appanonymous";
import { AppLoggedIn } from "./apploggedin";

/**
 * State for an App component.
 */
export interface IAppState {
    /**
     * Currently logged in player, if not anonymous.
     */
    player?: IPlayer;

    /**
     * 
     */
    messages: string[];
}

/**
 * 
 */
export class App extends React.Component<void, IAppState> {
    /**
     * Component state.
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
    public constructor(props?: void, context?: any) {
        super(props, context);
        this.storage = new AppStorage();
        this.sdk = new Sdk();
        this.state = {
            messages: []
        };

        this.socket = io();
        this.socket.on("report", (reportRaw: string): void => this.receiveMessage(reportRaw));

        if (this.storage.isComplete()) {
            this.receiveLoginValues(this.storage);
        }
    }

    /**
     * 
     */
    public render(): JSX.Element {
        console.log("Rendering", this.props, this.state);
        console.log("storage", this.storage);
        if (this.storage.isComplete()) {
            return (
                <AppLoggedIn
                    player={this.state.player}
                    messages={this.state.messages}
                    sdk={this.sdk} />);
        } else {
            return (
                <AppAnonymous
                    onLogin={(values: ILoginValues) => this.receiveLoginValues(values)}
                    sdk={this.sdk} />);
        }
    }

    /**
     * 
     */
    private receiveLoginValues(values: ILoginValues): void {
        console.log("Received values", values);
        this.storage.setValues(values);

        this.sdk.getPlayer(values.alias, values.passphrase)
            .then((report: IReport<IPlayer>): void => {
                console.log("Got player", report);
                this.setState({
                    player: report.data,
                    messages: this.state.messages
                });
            });
    }

    /**
     * 
     */
    private receiveMessage(message: string): void {
        const messages: string[] = this.state.messages.slice();
        messages.push(message);

        this.setState(
            { messages },
            (): void => {
                setTimeout(
                    (): void => this.trimMessagesIfNecessary(),
                    60000);
            });
    }

    /**
     * 
     */
    private trimMessagesIfNecessary(): void {
        if (this.state.messages.length > 50) {
            return;
        }

        this.setState({
            messages: this.state.messages.slice(
                this.state.messages.length - 50)
        });
    }
}
