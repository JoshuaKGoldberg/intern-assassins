/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { Sdk } from "../../sdk/sdk";
import { IUser } from "../../../../shared/users";
import { ActionButton } from "../profile/actionbutton";
import { UserField } from "./userfield";

/**
 * Props for a UsersTable component.
 */
export interface IUsersTableProps {
    /**
     * Information on the current admin.
     */
    admin: IUser;

    /**
     * Fields on users to display as columns.
     */
    fields: string[];

    /**
     * Title to to display.
     */
    heading: string;

    /**
     * Callback for submitting updates.
     */
    onUpdates: (updatedUsers: IUpdatedUsers) => void;

    /**
     * Wrapper around the server API.
     */
    sdk: Sdk;

    /**
     * Users to display in the table.
     */
    users?: IUser[];
}

/**
 * Updated users, keyed by alias.
 */
export interface IUpdatedUsers {
    [i: string]: IUser;
};

/**
 * State for a UsersTable component.
 */
interface IUsersTableState {
    /**
     * Updated users waiting to be submitted, keyed by alias.
     */
    updatedUsers: IUpdatedUsers;
}

/**
 * Component for an administrative table of users.
 */
export class UsersTable extends React.Component<IUsersTableProps, IUsersTableState> {
    /**
     * State for the component.
     */
    public state: IUsersTableState = {
        updatedUsers: {}
    };

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        if (!this.props.users || this.props.users.length === 0) {
            return <div class="users-table"></div>;
        }

        return (
            <div class="users-table">
                <h3>{this.props.heading}</h3>
                {this.renderUpdates()}
                {this.renderTable(
                    this.props.users
                        .filter((user: IUser): boolean => {
                            return !this.state.updatedUsers[user.alias];
                        }),
                    this.props.fields)}
            </div>);
    }

    /**
     * Renders a table of updated users.
     * 
     * @returns The rendered table.
     */
    private renderUpdates(): JSX.Element {
        if (Object.keys(this.state.updatedUsers).length === 0) {
            return undefined;
        }

        const users: IUser[] = Object
            .keys(this.state.updatedUsers)
            .map((key: string): IUser => this.state.updatedUsers[key]);

        return (
            <div className="users-table-updates">
                <h3>Pending updates</h3>
                {this.renderTable(users, this.props.fields)}
                <input
                    onClick={(): void => this.onUpdates()}
                    type="submit" />
            </div>);
    }

    /**
     * Renders a table of users.
     * 
     * @returns The rendered table of users.
     */
    private renderTable(users: IUser[], fields: string[]): JSX.Element {
        if (users.length === 0) {
            return <em>None!</em>;
        }

        return (
            <table>
                <thead>
                    <tr>
                        {this.renderHead(fields)}
                    </tr>
                </thead>
                <tbody>
                    {this.renderBody(users, fields)}
                </tbody>
            </table>);
    }

    /**
     * Renders the head component.
     * 
     * @param fields   Fields to display for later users.
     * @returns The rendered head component.
     */
    private renderHead(fields: string[]): JSX.Element[] {
        return [...fields, "actions"].map((key: string, i: number): JSX.Element => {
            return <th key={i}>{key}</th>;
        });
    }

    /**
     * Renders the body component.
     * 
     * @param users   Information for users.
     * @param fields   Fields to display on the users.
     * @returns The rendered body component.
     */
    private renderBody(users: IUser[], fields: string[]): JSX.Element[] {
        return users
            .map((user: IUser, i: number): JSX.Element => {
                return <tr key={i}>{this.renderUser(user, fields)}</tr>;
            });
    }

    /**
     * Renders a single user's row.
     * 
     * @param user   Information on a user.
     * @param fields   Fields to display on the user.
     * @returns The rendered user row.
     */
    private renderUser(user: IUser, fields: string[]): JSX.Element[] {
        const elements: JSX.Element[] = fields
            .filter((field: string): boolean => user.hasOwnProperty(field))
            .map((field: string, i: number): JSX.Element => {
                return (
                    <td key={i}>
                        <UserField
                            admin={this.props.admin}
                            editable={field !== "alias"}
                            field={field}
                            onNewValue={(newValue: string) => this.handleNewUserValue(user, field, newValue)}
                            user={user} />
                    </td>);
            });

        elements.push(
            <td key={elements.length}>
                <ActionButton
                    action={(): void => { this.killUserQuietly(user); }}
                    confirmationText={`Are you sure you want to kill ${user.alias}?`}
                    text="Kill Quietly" />
            </td>);

        return elements;
    }

    /**
     * Handles a user field reporting a new value.
     * 
     * @param user   The owning user.
     * @param field   The name of the user's field.
     * @param newValue   A new value for the user's field.
     */
    private handleNewUserValue(user: IUser, field: string, newValue: any): void {
        const updated: IUser = {
            alias: user.alias,
            codename: user.codename,
            passphrase: user.passphrase
        } as IUser;

        updated[field] = newValue;

        // Note: this should be switched to using an immutable structure...
        this.state.updatedUsers[updated.alias] = updated;
        this.setState({
            updatedUsers: this.state.updatedUsers
        });
    }

    /**
     * Removes a user from the game without increasing any kill count.
     * 
     * @param victim   A user to kill.
     * @returns A promise for removing the user.
     */
    private async killUserQuietly(user: IUser): Promise<void> {
        await this.props.sdk.killUserQuietly(this.props.admin, user);

        // Todo: be more elegant...
        location.reload();
    }

    /**
     * Submits pending updates.
     */
    private onUpdates(): void {
        this.props.onUpdates(this.state.updatedUsers);
        this.setState({
            updatedUsers: {}
        });
    }
}
