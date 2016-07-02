/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IClaim } from "../../../../shared/kills";
import { INotification } from "../../../../shared/notifications";
import { IRound } from "../../../../shared/rounds";
import { ILeader, IUser } from "../../../../shared/users";
import { ActionButton } from "../profile/actionbutton";
import { Greeting } from "../profile/greeting";
import { Sdk } from "../../sdk/sdk";
import { Sidebar } from "../sidebar/sidebar";
import { ClaimsTable } from "../admin/claimstable";
import { UsersImporter } from "../admin/usersimporter";
import { UsersTables } from "../admin/userstables";

/**
 * Props for an AppAdmin component.
 */
export interface IAppAdminProps {
    /**
     * Information on the admin.
     */
    admin: IUser;

    /**
     * Any active kill claims related to the user, if not anonymous.
     */
    claims?: IClaim[];

    /**
     * Leaders to be shown in the sidebar.
     */
    leaders: ILeader[];

    /**
     * Recently pushed notification messages.
     */
    notifications: INotification[];

    /**
     * Gameplay rounds.
     */
    rounds: IRound[];

    /**
     * Wrapper around the server API.
     */
    sdk: Sdk;
}

/**
 * Application component for a logged in user.
 */
export class AppAdmin extends React.Component<IAppAdminProps, void> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <div id="app" className="app-admin">
                <section id="profile">
                    <div id="logout">
                        <ActionButton action={(): void => this.logOut()} small text="Sign Out" />
                    </div>
                    <div className="area greeting-area">
                        <Greeting admin={true} codename={this.props.admin.codename} />
                    </div>

                    <ClaimsTable admin={this.props.admin} claims={this.props.claims} sdk={this.props.sdk} />

                    <UsersTables admin={this.props.admin} sdk={this.props.sdk} />
                    <UsersImporter
                        admin={this.props.admin}
                        onImport={(): void => this.onImport()}
                        sdk={this.props.sdk} />
                </section>
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

    /**
     * Reloads the page after a users import.
     */
    private onImport(): void {
        window.location.reload();
    }
}
