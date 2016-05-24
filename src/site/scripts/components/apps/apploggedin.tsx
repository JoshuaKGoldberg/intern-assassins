/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IPlayer } from "../../../../shared/players";
import { Sdk } from "../../sdk/sdk";
import { ActivityBar } from "../activitybar/activitybar";
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

export const AppLoggedIn: React.StatelessComponent<IAppLoggedInProps> = (props: IAppLoggedInProps): JSX.Element => {
    return (
        <div id="app" className="app-logged-in">
            <Profile {...props} />
            <ActivityBar messages={props.messages} />
        </div>);
};
