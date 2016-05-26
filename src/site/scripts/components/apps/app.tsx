/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/socket.io/index.d.ts" />

"use strict";
declare var io: SocketIOStatic;
import * as React from "react";
import { IReport } from "../../../../shared/actions";
import { IPlayer } from "../../../../shared/players";
import { ICredentials } from "../../../../shared/login";
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
     * Recently pushed notification messages.
     */
    messages: string[];
}

/**
 * Component for the entire container application.
 */
export class App extends React.Component<void, IAppState> {
    /**
     * State for the component.
     */
    public state: IAppState;

    /**
     * Client-side storage for login credentials.
     */
    private storage: AppStorage;

    /**
     * Wrapper around the server API.
     */
    private sdk: Sdk;

    /**
     * Real-time socket.io server.
     */
    private socket: SocketIO.Server;

    /**
     * Initializes a new instance of the App class.
     * 
     * @param props   Props for the component.
     * @param context   Optional container context.
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
            this.receiveLoginValues(this.storage.asCredentials());
        }
    }

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        if (this.storage.isComplete()) {
            return (
                <AppLoggedIn
                    player={this.state.player}
                    messages={this.state.messages}
                    sdk={this.sdk} />);
        } else {
            return (
                <AppAnonymous
                    onLogin={(values: ICredentials) => this.receiveLoginValues(values)}
                    sdk={this.sdk} />);
        }
    }

    /**
     * Handler for a successful login.
     * 
     * @param values   User login credentials.
     */
    private receiveLoginValues(values: ICredentials): void {
        this.storage.setValues(values);

        this.sdk.getPlayer(values)
            .then((report: IReport<IPlayer>): void => {
                this.setState({
                    player: report.data,
                    messages: this.state.messages
                });
            });
    }

    /**
     * Receives a notification message.
     */
    private receiveMessage(message: string): void {
        const messages: string[] = this.state.messages.slice();
        messages.push(message);

        this.setState({
            messages: messages
        });
    }
}
