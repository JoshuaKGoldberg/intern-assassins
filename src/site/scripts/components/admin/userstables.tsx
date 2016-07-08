/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { Sdk } from "../../sdk/sdk";
import { IUpdate } from "../../../../shared/actions";
import { ICredentials } from "../../../../shared/login";
import { IUser } from "../../../../shared/users";
import { IUpdatedUsers, UsersTable } from "./userstable";

/**
 * Props for a UsersTables component.
 */
export interface IUsersTablesProps {
    /**
     * Information on the current admin.
     */
    admin: IUser;

    /**
     * Wrapper around the server API.
     */
    sdk: Sdk;
}

/**
 * State for a UsersTables component.
 */
interface IUsersTablesState {
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

        this.props.sdk.getUsers(this.props.admin)
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

        const usersAlive: IUser[] = this.state.users.filter(
            (user: IUser): boolean => !user.admin && user.alive);
        const usersDead: IUser[] = this.state.users.filter(
            (user: IUser): boolean => !user.admin && !user.alive);
        const admins: IUser[] = this.state.users.filter(
            (user: IUser): boolean => user.admin);

        return (
            <div id="administration">
                <UsersTable
                    admin={this.props.admin}
                    fields={["alias", "codename", "kills", "passphrase", "target"]}
                    heading="Alive"
                    onUpdates={(updatedUsers: IUpdatedUsers): Promise<void> => this.onUpdates(updatedUsers)}
                    sdk={this.props.sdk}
                    users={usersAlive} />
                <UsersTable
                    admin={this.props.admin}
                    fields={["alias", "codename", "kills", "passphrase"]}
                    heading="Dead"
                    onUpdates={(updatedUsers: IUpdatedUsers): Promise<void> => this.onUpdates(updatedUsers)}
                    sdk={this.props.sdk}
                    users={usersDead} />
                <UsersTable
                    admin={this.props.admin}
                    fields={["alias", "codename"]}
                    heading="Admins"
                    onUpdates={(updatedUsers: IUpdatedUsers): Promise<void> => this.onUpdates(updatedUsers)}
                    sdk={this.props.sdk}
                    users={admins} />
            </div>);
    }

    /**
     * Submits pending updates to the server.
     * 
     * @param updatedUsers   Descriptions of updated users.
     * @returns A promise for the users being updated.
     */
    private async onUpdates(updatedUsers: IUpdatedUsers): Promise<void> {
        await this.props.sdk.postUsers(
            this.props.admin,
            Object.keys(updatedUsers)
                .map((key: string): IUpdate<ICredentials, ICredentials> => {
                    const updatedUser: ICredentials = updatedUsers[key];

                    return {
                        filter: {
                            alias: updatedUser.alias
                        } as ICredentials,
                        updated: updatedUser
                    };
                }));

        // Todo: be less inelegant
        window.location.reload();
    }
}
