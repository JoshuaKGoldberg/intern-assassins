/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/socket.io/index.d.ts" />

"use strict";
declare var io: SocketIOStatic;
import * as React from "react";
import { IKillClaim } from "../../../../shared/kills";
import { IReport } from "../../../../shared/actions";
import { IUser } from "../../../../shared/users";
import { ICredentials } from "../../../../shared/login";
import { AppStorage } from "../../storage/appstorage";
import { Sdk } from "../../sdk/sdk";
import { AppAdmin } from "./appadmin";
import { AppAnonymous } from "./appanonymous";
import { AppUser } from "./appuser";

/**
 * State for an App component.
 */
export interface IAppState {
    /**
     * Any active kill claims related to the user, if not anyonymous.
     */
    killClaimReports?: IReport<IKillClaim>[];

    /**
     * Recently pushed notification messages.
     */
    messages: string[];

    /**
     * Currently logged in user, if not anonymous.
     */
    user?: IUser;
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
            this.receiveCredentials(this.storage.asCredentials());
        }
    }

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        if (this.storage.isComplete()) {
            if (this.state.user && this.state.user.admin) {
                return (
                    <AppAdmin
                        sdk={this.sdk}
                        user={this.state.user} />);
            }

            return (
                <AppUser
                    killClaimReports={this.state.killClaimReports}
                    messages={this.state.messages}
                    refreshUserData={(): void => { this.refreshUserData(); }}
                    sdk={this.sdk}
                    user={this.state.user} />);
        }

        return (
            <AppAnonymous
                onLogin={(values: ICredentials) => this.receiveCredentials(values)}
                sdk={this.sdk} />);
    }

    /**
     * Handler for a successful login.
     * 
     * @param values   User login credentials.
     */
    private receiveCredentials(credentials: ICredentials): void {
        this.storage.setValues(credentials);
        this.refreshUserData();
    }

    /**
     * Sends a request for relevant user data, then refreshes state.
     * 
     * @returns A promise for loading the data.
     */
    private async refreshUserData(): Promise<void> {
        const credentials: ICredentials = this.storage.asCredentials();
        const [userReport, killClaimReports] = await Promise.all(
            [
                this.sdk.getUser(credentials),
                this.sdk.getUserActiveKillClaims(credentials)
            ])
            .catch((error: Error): void => {
                console.log("Error!", error);
            });

        this.setState({
            killClaimReports: killClaimReports,
            messages: this.state.messages,
            user: userReport.data
        });
    }

    /**
     * Receives a notification message.
     * 
     * @param message   The notification message contents.
     */
    private receiveMessage(message: string): void {
        const messages: string[] = this.state.messages.slice();
        messages.push(message);

        this.setState({
            messages: messages
        });
    }
}
