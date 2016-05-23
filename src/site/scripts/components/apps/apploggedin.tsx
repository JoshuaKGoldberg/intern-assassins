/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { IReport } from "../../../../shared/actions";
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
    recentReports: IReport<any>[];

    /**
     * 
     */
    reportUpdate: () => void;

    /**
     * 
     */
    sdk: Sdk;
}

export const AppLoggedIn: React.StatelessComponent<IAppLoggedInProps> = (props: IAppLoggedInProps): JSX.Element => {
    return (
        <div id="app" className="app-logged-in">
            <Profile {...props} />
            <ActivityBar recentReports={props.recentReports} />
        </div>);
};
