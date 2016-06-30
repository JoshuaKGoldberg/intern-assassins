/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { ICredentials } from "../../../../shared/login";
import { IUser } from "../../../../shared/users";

/**
 * Props for an UserField component.
 */
export interface IUserFieldProps {
    /**
     * Information on the current admin.
     */
    admin: IUser;

    /**
     * Whether the content can be updated.
     */
    editable: boolean;

    /**
     * Key of the user's field.
     */
    field: string;

    /**
     * Handler for when a new value is requested.
     * 
     * @param newValue   The new value.
     */
    onNewValue: (newValue: string) => void;

    /**
     * Container user owning the field.
     */
    user: ICredentials;
}

/**
 * State for a UserField component.
 */
interface IUserFieldState {
    /**
     * Whether this is currently editing.
     */
    editing?: boolean;

    /**
     * New value for the field, if provided.
     */
    newValue?: string;
}

/**
 * Component for an editable user's field.
 */
export class UserField extends React.Component<IUserFieldProps, IUserFieldState> {
    /**
     * Reference for the editable input.
     */
    private static refInput: string;

    /**
     * State for the component.
     */
    public state: IUserFieldState = {
        editing: false
    };

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return this.state.editing ? this.renderEditing() : this.renderStatic();
    }

    /**
     * Renders the component in editing state.
     * 
     * @returns The rendered component.
     */
    private renderEditing(): JSX.Element {
        return (
            <div className="user-field user-field-editing">
                <input
                    placeholder={this.props.user[this.props.field]}
                    onChange={(event: React.FormEvent): void => this.onChange(event)}
                    type="text"
                    value={this.state.newValue} />
                <div className="user-field-actions">
                    <input
                        disabled={!this.state.newValue}
                        onClick={(): Promise<void> => this.onSubmit()}
                        type="button"
                        value="submit" />
                    <input
                        onClick={(): void => this.onCancel()}
                        type="button"
                        value="cancel" />
                </div>
            </div>);
    }

    /**
     * Renders the component in static state.
     * 
     * @returns The rendered component.
     */
    public renderStatic(): JSX.Element {
        return (
            <div className="user-field user-field-static">
                <input
                    onClick={(): void => this.onActivate()}
                    readonly={this.props.editable ? "" : "readonly"}
                    ref={UserField.refInput}
                    type="text"
                    value={this.props.user[this.props.field]} />
            </div>);
    }

    /**
     * 
     */
    private onActivate(): void {
        if (!this.props.editable) {
            return;
        }

        this.setState({
            editing: true,
            newValue: this.props.user[this.props.field]
        });
    }

    /**
     * 
     */
    private onCancel(): void {
        this.setState({
            editing: false,
            newValue: undefined
        });
    }

    /**
     * 
     */
    private onChange(event: React.FormEvent): void {
        this.setState({
            newValue: (event.target as any).value
        });
    }

    /**
     * 
     */
    private async onSubmit(): Promise<void> {
        if (!this.state.newValue) {
            return;
        }

        this.props.onNewValue(this.state.newValue);
        this.onCancel();
    }
}
