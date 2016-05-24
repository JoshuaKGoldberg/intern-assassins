/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IPlayer } from "../../../../shared/players";
import { Sdk } from "../../sdk/sdk";
import { ActivityBar } from "../activitybar/activitybar";
import { ActionButton } from "../profile/actionbutton";
import { Profile } from "../profile/profile";

/**
 * 
 */
export interface IAppLoggedInProps {
    /**
     * 
     */
    player: IPlayer;

    /**
     * 
     */
    messages: string[];

    /**
     * 
     */
    sdk: Sdk;
}

/**
 * 
 */
export class AppLoggedIn extends React.Component<IAppLoggedInProps, void> {
    /**
     * Renders the component.
     */
    public render(): JSX.Element {
        return (
            <div id="app" className="app-logged-in">
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
