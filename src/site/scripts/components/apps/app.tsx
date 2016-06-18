/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IKillClaim } from "../../../../shared/kills";
import { INotification, NotificationCause } from "../../../../shared/notifications";
import { ILeader, IUser } from "../../../../shared/users";
import { ICredentials } from "../../../../shared/login";
import { SocketHandler } from "../../sockets/sockethandler";
import { AppStorage } from "../../storage/appstorage";
import { Sdk } from "../../sdk/sdk";
import { AppAdmin } from "./appadmin";
import { AppAnonymous } from "./appanonymous";
import { AppUser } from "./appuser";

/**
 * State for an App component.
 */
interface IAppState {
    /**
     * Any active kill claims related to the user, if not anyonymous.
     */
    killClaims?: IKillClaim[];

    /**
     * Leaders retrieved from the server.
     */
    leaders: ILeader[];

    /**
     * Recently pushed notification messages.
     */
    notifications: INotification[];

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
     * Wrapper around a real-time socket.io server.
     */
    private socketHandler: SocketHandler<INotification, IAppState>;

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
            leaders: [],
            notifications: []
        };

        this.socketHandler = new SocketHandler<INotification, IAppState>()
            .setRouter((notification: INotification): NotificationCause => notification.cause)
            .setReceiver((state: IAppState, notification: INotification): void => this.receiveState(state, notification))
            .registerHandler(
                NotificationCause.Kill,
                (notification: INotification): IAppState => this.handleKillNotification(notification));

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
                        leaders={this.state.leaders}
                        notifications={this.state.notifications}
                        user={this.state.user}
                        sdk={this.sdk} />);
            }

            return (
                <AppUser
                    killClaims={this.state.killClaims}
                    leaders={this.state.leaders}
                    notifications={this.state.notifications}
                    refreshUserData={(): void => { this.refreshData(); }}
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
        this.refreshData();
    }

    /**
     * Sends a request for relevant user data, then refreshes state.
     * 
     * @returns A promise for loading the data.
     */
    private async refreshData(): Promise<void> {
        const credentials: ICredentials = this.storage.asCredentials();
        const [user, killClaims, leaders, notifications] = await Promise.all([
            this.sdk.getUser(credentials),
            this.sdk.getUserActiveKillClaims(credentials),
            this.sdk.getLeaders(),
            this.sdk.getNotifications()
        ]);

        this.setState({
            killClaims: killClaims,
            leaders: leaders,
            notifications: notifications,
            user: user
        });
    }

    /**
     * Generates a new state from a kill notification.
     * 
     * @param notification   The triggering notification.
     * @returns A new state.
     */
    private handleKillNotification(notification: INotification): IAppState {
        // When this is moved to Flux, make a(n immutable) copy of this.state. See issue #83.
        const newState: IAppState = this.state;

        newState.leaders
            .find((leader: ILeader): boolean => leader.nickname === notification.nickname)
            .kills += 1;

        return newState;
    }

    /**
     * Receives a new state from the socket handler.
     * 
     * @param state   A new state.
     * @param notification   The triggering notification.
     */
    private receiveState(state: IAppState, notification: INotification): void {
        const notifications: INotification[] = [...this.state.notifications, notification];

        this.setState(
            { notifications } as any,
            (): void => {
                // If you did something, fetch new target information from the server
                if (notification.nickname === this.state.user.nickname) {
                    this.refreshData();
                }
            });
    }
}
