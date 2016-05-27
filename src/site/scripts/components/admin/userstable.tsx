/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { Sdk } from "../../sdk/sdk";
import { IReport } from "../../../../shared/actions";
import { IUser } from "../../../../shared/users";

/**
 * Props for a UsersTable component.
 */
export interface IUsersTableProps {
    /**
     * 
     */
    sdk: Sdk;

    /**
     * 
     */
    user: IUser;
}

/**
 * 
 */
export interface IUsersTableState {
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
export class UsersTable extends React.Component<IUsersTableProps, IUsersTableState> {
    /**
     * Initializes a new instance of the UsersTable class.
     * 
     * @param props   Props for the component.
     * @param context   Optional container context.
     */
    public constructor(props?: IUsersTableProps, context?: any) {
        super(props, context);
        this.state = {
            loading: true,
        };

        this.props.sdk.getUsers(this.props.user)
            .then((users: IReport<IUser>[]): void => {
                this.setState({
                    loading: false,
                    users: users
                        .map((report: IReport<IUser>): IUser => report.data)
                        .sort((a: IUser, b: IUser): number => {
                            if (a.admin !== b.admin) {
                                return a.admin ? -1 : 1;
                            }

                            return a.alias < b.alias ? -1 : 1;
                        })
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
                <table>
                    <thead>
                        {this.renderHead()}
                    </thead>
                    <tbody>
                        {this.renderBody()}
                    </tbody>
                </table>
            </div>);
    }

    /**
     * Renders the head component.
     * 
     * @returns The rendered head component.
     */
    private renderHead(): JSX.Element[] {
        return Object.keys(this.state.users[0])
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
        return this.state.users
            .map((user: IUser, i: number): JSX.Element => {
                return <tr key={i}>{this.renderUser(user)}</tr>;
            });
    }

    /**
     * Renders a single user's row.
     * 
     * @param user   Information on a user.
     * 
     */
    private renderUser(user: IUser): JSX.Element[] {
        return Object.keys(user) // use preset keys in shared, not object.keys
            .map((key: string, i: number): JSX.Element => {
                return <td key={i}>{user[key]}</td>;
            });
    }
}
