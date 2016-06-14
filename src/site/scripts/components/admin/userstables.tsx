/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { Sdk } from "../../sdk/sdk";
import { IUser } from "../../../../shared/users";
import { UsersTable } from "./userstable";

/**
 * Props for a UsersTables component.
 */
export interface IUsersTablesProps {
    /**
     * Wrapper around the server API.
     */
    sdk: Sdk;

    /**
     * Information on the current user.
     */
    user: IUser;
}

/**
 * State for a UsersTables component.
 */
export interface IUsersTablesState {
    /**
     * Whether the users list is still loading.
     */
    loading: boolean;

    /**
     * Users loaded from the sdk.
     */
    users?: IUser[];
}

/**
 * Component for an administrative table of users.
 */
export class UsersTables extends React.Component<IUsersTablesProps, IUsersTablesState> {
    /**
     * Initializes a new instance of the UsersTables class.
     * 
     * @param props   Props for the component.
     * @param context   Optional container context.
     */
    public constructor(props?: IUsersTablesProps, context?: any) {
        super(props, context);
        this.state = {
            loading: true,
        };

        this.props.sdk.getUsers(this.props.user)
            .then((users: IUser[]): void => {
                this.setState({
                    loading: false,
                    users: users
                });
            });
    }

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        if (this.state.loading) {
            return <div class="loading">Loading users...</div>;
        }

        return (
            <div id="administration">
                <UsersTable
                    fields={["alias", "nickname", "target"]}
                    heading="Alive"
                    users={this.state.users.filter(user => user.alive)} />
                <UsersTable
                    fields={["alias", "nickname"]}
                    heading="Dead"
                    users={this.state.users.filter(user => !user.alive)} />
                <UsersTable
                    fields={["alias", "nickname"]}
                    heading="Admins"
                    users={this.state.users.filter(user => user.admin)} />
            </div>);
    }
}
