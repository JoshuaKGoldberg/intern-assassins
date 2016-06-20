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
     * Title to to display.
     */
    heading: string;

    /**
     * Users to display in the table.
     */
    users?: IUser[];
}

/**
 * Component for an administrative table of users.
 */
export class UsersTable extends React.Component<IUsersTableProps, void> {
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
        return this.props.users
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
