/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IUser } from "../../../../shared/users";
import { Sdk } from "../../sdk/sdk";
import { ActivityBar } from "../activitybar/activitybar";
import { ActionButton } from "../profile/actionbutton";
import { Profile } from "../profile/profile";

/**
 * Props for an AppUser component.
 */
export interface IAppUserProps {
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
    messages: string[];
}

/**
 * Application component for a logged in user.
 */
export class AppUser extends React.Component<IAppUserProps, void> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <div id="app" className="app-user">
                <ActionButton text="x" small action={(): void => this.logOut()} />
                <Profile {...this.props} />
                <ActivityBar messages={this.props.messages} />
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
