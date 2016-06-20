/// <reference path="../../../../../typings/jszip/index.d.ts" />
/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dropzone/index.d.ts" />
/// <reference path="../../../../../typings/xlsx/index.d.ts" />

"use strict";
import * as React from "react";
import * as Dropzone from "react-dropzone";
import { IUser } from "../../../../shared/users";
import { IPartialUser, SheetParser } from "../../storage/sheetparser";
import { Sdk } from "../../sdk/sdk";
import { ActionButton } from "../profile/actionbutton";
declare var XLSX: any;

/**
 * Properties for a UsersImporter component.
 */
export interface IUsersImporterProps {
    /**
     * Callback for after importing.
     */
    onImport?: () => void;

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
     * Initializes a new instance of the UsersImporter class.
     * 
     * @param props   Properties for the component.
     * @param context   Optional parent context.
     */
    public constructor(props: IUsersImporterProps, context?: any) {
        super(props, context);

        requirejs(["jszip"], (jszip: JSZip) => {
            (window as any).JSZip = jszip;
            requirejs(["xlsx"]);
        });
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
                {this.renderDropzone()}
                {this.renderImport()}
            </div>);
    }

    /**
     * Renders the file drop area.
     * 
     * @returns The rendered file drop area.
     */
    private renderDropzone(): JSX.Element {
        if (this.state.importing) {
            return <h3>Confirm Import</h3>;
        }

        return (
            <Dropzone
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onDrop={(files: File[]): void => this.handleDrop(files)}
                style={{}}>
                <input type="button" value="Import .xlsx" />
            </Dropzone>);
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
                            <th>nickname</th>
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
                    text="Confrm!" />
            </div>);
    }

    /**
     * Renders a staged user to be imported.
     * 
     * @param user   The staged user.
     * @param i   The index of the user's row.
     * @returns 
     */
    private renderPartialUser(user: IPartialUser, i: number): JSX.Element {
        return (
            <tr key={i}>
                <td>{user.alias}</td>
                <td>{user.nickname}</td>
                <td>{user.target}</td>
            </tr>);
    }

    /**
     * Handles an Excel file being selected.
     * 
     * @param files   Files being selected.
     * @remarks Only the first file is respected.
     */
    private handleDrop(files: File[]): void {
        this.setState(
            {
                importing: true
            },
            (): void => {
                const reader = new FileReader();
                const file: File = files[0];

                reader.onload = (event: ProgressEvent): void => {
                    const data: string = (event.target as any).result;
                    const parsedFile: any = XLSX.read(data, {
                        type: "binary"
                    });
                    const sheet: any = parsedFile.Sheets.Sheet1;
                    const users = new SheetParser(sheet).collectUsers();
                    this.setState({
                        importingUsers: users
                    });
                };

                reader.readAsBinaryString(file);
            });
    }

    /**
     * Finalizes importing the staged users.
     */
    private async import(): Promise<void> {
        await this.props.sdk.importUsers(this.props.user, this.state.importingUsers);

        this.setState(
            {
                importing: false,
                importingUsers: undefined
            },
            this.props.onImport);
    }
}
