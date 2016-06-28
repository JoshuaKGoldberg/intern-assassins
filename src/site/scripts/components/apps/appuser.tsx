/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IClaim, IKill } from "../../../../shared/kills";
import { IRound } from "../../../../shared/rounds";
import { INotification } from "../../../../shared/notifications";
import { ILeader, IUser } from "../../../../shared/users";
import { Sdk } from "../../sdk/sdk";
import { Sidebar } from "../sidebar/sidebar";
import { ActionButton } from "../profile/actionbutton";
import { Profile } from "../profile/profile";

/**
 * Props for an AppUser component.
 */
export interface IAppUserProps {
    /**
     * Any active kill claims related to the user.
     */
    claims: IClaim[];

    /**
     * Any recorded kills by the user.
     */
    kills: IKill[];

    /**
     * Leaders to be shown in the sidebar.
     */
    leaders: ILeader[];

    /**
     * Recently pushed notification messages.
     */
    notifications: INotification[];

    /**
     * Hook to request new user data from the server.
     */
    refreshUserData: () => void;

    /**
     * Gameplay rounds.
     */
    rounds: IRound[];

    /**
     * Wrapper around the server API.
     */
    sdk: Sdk;

    /**
     * Information on the user.
     */
    user: IUser;
}

/**
 * Application component for a logged in user.
 */
export class AppUser extends React.Component<IAppUserProps, void> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <div id="app" className="app-user">
                <div id="logout">
                    <ActionButton action={(): void => this.logOut()} small text="x" />
                </div>
                <Profile {...this.props} />
                <Sidebar
                    leaders={this.props.leaders}
                    notifications={this.props.notifications}
                    rounds={this.props.rounds} />
            </div>);
    }

    /**
     * Clears local storage to log out, then refreshes.
     */
    private logOut(): void {
        localStorage.clear();
        window.location.reload();
    }
}
