/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IKill, IClaim } from "../../../../shared/kills";
import { ICredentials } from "../../../../shared/login";
import { INotification, NotificationCause } from "../../../../shared/notifications";
import { IRound } from "../../../../shared/rounds";
import { ILeader, IUser } from "../../../../shared/users";
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
     * Any active kill claims related to the user, if not anonymous.
     */
    claims?: IClaim[];

    /**
     * Any recorded kills by the user, if not anonymous.
     */
    kills?: IKill[];

    /**
     * Leaders retrieved from the server.
     */
    leaders: ILeader[];

    /**
     * Recently pushed notification messages.
     */
    notifications: INotification[];

    /**
     * Gameplay rounds.
     */
    rounds?: IRound[];

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
            .setReceiver((state: IAppState, notification: INotification): void => this.receiveState(state, notification));

        this.registerSocketHandler(NotificationCause.Death, this.handleDeathNotification);
        this.registerSocketHandler(NotificationCause.Kill, this.handleKillNotification);
        this.registerSocketHandler(NotificationCause.KillClaimToVictim, this.handleKillClaimToVictimNotification);

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
                    claims={this.state.claims}
                    kills={this.state.kills}
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
     * Registers a member function to handle a notification.
     * 
     * @param cause   The notification cause.
     * @param callback   A member function.
     */
    private registerSocketHandler(cause: NotificationCause, callback: Function): void {
        this.socketHandler.registerHandler(
            cause,
            (notification: INotification): IAppState => callback.call(this, notification));
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
        const [claims, kills, leaders, notifications, rounds, user] = await Promise.all([
            this.sdk.getClaims(credentials),
            this.sdk.getKills(credentials),
            this.sdk.getLeaders(),
            this.sdk.getNotifications(),
            this.sdk.getRounds(),
            this.sdk.getUser(credentials),
        ]);

        this.setState({ claims, kills, leaders, notifications, rounds, user });
    }

    /**
     * Generates a new state from a death notification.
     * 
     * @param notification   The triggering notification.
     * @returns A new state.
     * @remarks Because the death is of the user, the page is reloaded.
     */
    private handleDeathNotification(notification: INotification): IAppState {
        // Eventually, claim notifications will only be sent to relevent users. See #113.
        if (notification.codename !== this.state.user.codename) {
            return this.state;
        }

        // When this is moved to Flux, make a(n immutable) copy of this.state. See issue #83.
        const newState: IAppState = this.state;

        newState.user.alive = false;
        newState.leaders
            .find((leader: ILeader): boolean => leader.codename === notification.codename)
            .alive = false;

        return newState;
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
            .find((leader: ILeader): boolean => leader.codename === notification.codename)
            .kills += 1;

        return newState;
    }

    /**
     * Generates a new state from a victim's claim notification.
     * 
     * @param notification   The triggering notification.
     * @returns A new state.
     */
    private handleKillClaimToVictimNotification(notification: INotification): IAppState {
        // Eventually, claim notifications will only be sent to relevent users. See #113.
        if (notification.codename !== this.state.user.codename) {
            return this.state;
        }

        // When this is moved to Flux, make a(n immutable) copy of this.state. See issue #83.
        const newState: IAppState = this.state;

        newState.claims.push({
            killer: undefined,
            victim: newState.user.alias,
            timestamp: notification.timestamp
        });

        return newState;
    }

    /**
     * Receives a new notification from the socket handler.
     * 
     * @param state   A new state.
     * @param notification   The triggering notification.
     */
    private receiveState(state: IAppState, notification: INotification): void {
        state.notifications = [...state.notifications, notification];

        this.setState(
            state,
            async (): Promise<void> => {
                // If necessary, fetch a new target from the server
                if (notification.cause === NotificationCause.Kill) {
                    const credentials: ICredentials = this.storage.asCredentials();
                    const newUser: IUser = await this.sdk.getUser(credentials);
                    this.setState({ user: newUser } as any);
                }
            });
    }
}
