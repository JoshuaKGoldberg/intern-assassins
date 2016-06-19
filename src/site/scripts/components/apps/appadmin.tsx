/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { INotification } from "../../../../shared/notifications";
import { ILeader, IUser } from "../../../../shared/users";
import { ActionButton } from "../profile/actionbutton";
import { Greeting } from "../profile/greeting";
import { Sdk } from "../../sdk/sdk";
import { Sidebar } from "../sidebar/sidebar";
import { UsersImporter } from "../admin/usersimporter";
import { UsersTables } from "../admin/userstables";

/**
 * Props for an AppAdmin component.
 */
export interface IAppAdminProps {
    /**
     * Wrapper around the server API.
     */
    sdk: Sdk;

    /**
     * Information on the user.
     */
    user: IUser;

    /**
     * Recently pushed notification messages.
     */
    notifications: INotification[];

    /**
     * Leaders to be shown in the sidebar.
     */
    leaders: ILeader[];
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
                        <ActionButton action={(): void => this.logOut()} small text="x" />
                    </div>
                    <div className="area greeting-area">
                        <Greeting admin={this.props.user.admin} nickname={this.props.user.nickname} />
                    </div>

                    <UsersTables sdk={this.props.sdk} user={this.props.user} />
                    <UsersImporter sdk={this.props.sdk} user={this.props.user} />
                </section>
                <Sidebar notifications={this.props.notifications} leaders={this.props.leaders} />
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
