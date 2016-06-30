/// <reference path="../../../../../typings/jszip/index.d.ts" />
/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/xlsx/index.d.ts" />

"use strict";
import * as React from "react";
import { IUser } from "../../../../shared/users";
import { IPartialUser, CsvParser } from "../../storage/csvparser";
import { Sdk } from "../../sdk/sdk";
import { ActionButton } from "../profile/actionbutton";
declare var XLSX: any;

/**
 * Properties for a UsersImporter component.
 */
export interface IUsersImporterProps {
    /**
     * Information on the admin.
     */
    admin: IUser;

    /**
     * Callback for after importing.
     */
    onImport?: () => void;

    /**
     * Wrapper around the server API.
     */
    sdk: Sdk;
}

/**
 * State for a UsersImporter component.
 */
interface IUsersImporterState {
    /**
     * Whether importing is currently happening.
     */
    importing?: boolean;

    /**
     * Users currently being imported.
     */
    importingUsers?: IPartialUser[];
}

/**
 * Component to import users as an admin.
 */
export class UsersImporter extends React.Component<IUsersImporterProps, IUsersImporterState> {
    /**
     * Reference key for the file input.
     */
    private static keyFileInput: string = "fileInput";

    /**
     * Initializes a new instance of the UsersImporter class.
     * 
     * @param props   Properties for the component.
     * @param context   Optional parent context.
     */
    public constructor(props: IUsersImporterProps, context?: any) {
        super(props, context);
    }

    /**
     * State for the component.
     */
    public state: IUsersImporterState = {};

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <div className={"users-importer"}>
                {this.renderFileInput()}
                {this.renderImport()}
            </div>);
    }

    /**
     * Renders the file drop area.
     * 
     * @returns The rendered file drop area.
     */
    private renderFileInput(): JSX.Element {
        if (this.state.importing) {
            return <h3>Confirm Import</h3>;
        }

        return (
            <form onSubmit={(event: React.FormEvent): void => this.uploadFile(event)}>
                <input type="file" name="file" ref={UsersImporter.keyFileInput} /><br />
                <input type="submit" />
            </form>);
    }

    /**
     * Renders the import staging area.
     * 
     * @returns The import staging area.
     */
    private renderImport(): JSX.Element {
        if (!this.state.importingUsers) {
            return undefined;
        }

        return (
            <div className="importing-table">
                <table>
                    <thead>
                        <tr>
                            <th>alias</th>
                            <th>codename</th>
                            <th>target</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.importingUsers.map(
                            (user: IPartialUser, i: number): JSX.Element => {
                                return this.renderPartialUser(user, i);
                            })}
                    </tbody>
                </table>
                <ActionButton
                    action={(): void => { this.import(); }}
                    text="Confirm!" />
            </div>);
    }

    /**
     * Renders a staged user to be imported.
     * 
     * @param user   The staged user.
     * @param i   The index of the user's row.
     * @returns The rendered partial user.
     */
    private renderPartialUser(user: IPartialUser, i: number): JSX.Element {
        return (
            <tr key={i}>
                <td>{user.alias}</td>
                <td>{user.codename}</td>
                <td>{user.target}</td>
            </tr>);
    }

    /**
     * Handles a .csv file being selected.
     * 
     * @param event   The triggering event.
     */
    private uploadFile(event: React.FormEvent): void {
        event.preventDefault();

        const file = (this.refs[UsersImporter.keyFileInput] as HTMLInputElement).files[0];
        if (!file) {
            return;
        }

        this.setState(
            {
                importing: true
            },
            (): void => {
                const reader = new FileReader();

                reader.onload = (): void => {
                    const users = new CsvParser(reader.result).collectUsers();
                    this.setState({
                        importingUsers: users
                    });
                };

                reader.readAsText(file);
            });
    }

    /**
     * Finalizes importing the staged users.
     */
    private async import(): Promise<void> {
        await this.props.sdk.importUsers(this.props.admin, this.state.importingUsers);

        this.setState(
            {
                importing: false,
                importingUsers: undefined
            },
            this.props.onImport);
    }
}
