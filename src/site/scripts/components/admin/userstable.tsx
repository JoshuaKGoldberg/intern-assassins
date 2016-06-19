/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IUser } from "../../../../shared/users";

/**
 * Props for a UsersTable component.
 */
export interface IUsersTableProps {
    /**
     * Fields on users to display as columns.
     */
    fields: string[];

    /**
     * Optional filter to restrict users listed.
     */
    filter?: IUserFilter;

    /**
     * Title to to display.
     */
    heading: string;

    /**
     * Users to display in the table.
     */
    users?: IUser[];
}

/**
 * Checks if a user should be displayed in a table.
 * 
 * @param user   User attributes being filtered.
 * @returns Whether the user should be displayed.
 */
export interface IUserFilter {
    (user: IUser): boolean;
}

/**
 * Component for an administrative table of users.
 */
export class UsersTable extends React.Component<IUsersTableProps, void> {
    /**
     * User filter to allow only non-admin users.
     * 
     * @param user   User attributes being filtered.
     * @returns Whether the user should be displayed.
     */
    public static filterToNonAdminUsers(user: IUser): boolean {
        return !user.admin;
    }

    /**
     * User filter to allow only admin users.
     * 
     * @param user   User attributes being filtered.
     * @returns Whether the user should be displayed.
     */
    public static filterToAdminUsers(user: IUser): boolean {
        return !!user.admin;
    }

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
                {this.renderTable()}
            </div>);
    }

    /**
     * Renders the table of users.
     * 
     * @returns The rendered table of users.
     */
    public renderTable(): JSX.Element {
        if (this.props.users.length === 0) {
            return <em>None!</em>;
        }

        return (
            <table>
                <thead>
                    <tr>
                        {this.renderHead()}
                    </tr>
                </thead>
                <tbody>
                    {this.renderBody()}
                </tbody>
            </table>);
    }

    /**
     * Renders the head component.
     * 
     * @returns The rendered head component.
     */
    private renderHead(): JSX.Element[] {
        return this.props.fields
            .map((key: string, i: number): JSX.Element => {
                return <th key={i}>{key}</th>;
            });
    }

    /**
     * Renders the body component.
     * 
     * @returns The rendered body component.
     */
    private renderBody(): JSX.Element[] {
        const users: IUser[] = this.props.filter
            ? this.props.users.filter(this.props.filter)
            : this.props.users;

        return users
            .map((user: IUser, i: number): JSX.Element => {
                return <tr key={i}>{this.renderUser(user)}</tr>;
            });
    }

    /**
     * Renders a single user's row.
     * 
     * @param user   Information on a user.
     * @returns The rendered user row.
     */
    private renderUser(user: IUser): JSX.Element[] {
        return this.props.fields
            .filter((field: string): boolean => user.hasOwnProperty(field))
            .map((field: string, i: number): JSX.Element => {
                return <td key={i}>{user[field].toString()}</td>;
            });
    }
}
