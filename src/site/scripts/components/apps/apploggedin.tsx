/// <reference path="../../../../../typings/react/index.d.ts" />

import * as React from "react";
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
    alias: string;

    /**
     * 
     */
    sdk: Sdk;
}

export const AppLoggedIn: React.StatelessComponent<IAppLoggedInProps> = (props: IAppLoggedInProps): JSX.Element => {
    return (
        <div id="app" className="app-logged-in">
            <Profile alias={props.alias} sdk={props.sdk} />
            <ActivityBar />
        </div>);
};
