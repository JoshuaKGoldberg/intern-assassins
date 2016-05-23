/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

import * as React from "react";
import { IAppLoggedInProps } from "../apps/apploggedin";
import { Actions } from "./actions";
import { Greeting } from "./greeting";
import { InfoDisplay } from "./infodisplay";

/**
 * 
 */
export const Profile: React.StatelessComponent<IAppLoggedInProps> = (props: IAppLoggedInProps): JSX.Element => {
    if (!props.player) {
        return (
            <section id="profile" className="loading">
                loading profile...
            </section>);
    }

    if (!props.player.nickname) {
        return (
            <section id="profile" className="loading">
                loading profile for {props.player.nickname}...
            </section>);
    }

    return (
        <section id="profile">
            <div className="area greeting-area">
                <Greeting nickname={props.player.nickname} />
            </div>

            <div className="area profile-picture-area">
                <img src={`https://me.microsoft.com/ThumbnailPhoto.ashx?email=${props.player.alias}@microsoft.com`} />
            </div>

            <div className="area info-display-area">
                <InfoDisplay info="alias" display={props.player.alias} />
                <InfoDisplay info="nickname" display={props.player.nickname} editable={true} />
                <InfoDisplay info="target" display={props.player.target} />
            </div>

            <div class="area">
                <Actions
                    alive={props.player.alive}
                    onDeath={(): void => {
                        props.sdk.reportKillClaim(props.player.alias, props.player.alias, props.player.passphrase)
                            .then((): void => props.reportUpdate());
                    }}
                    onKill={(): void => {
                        props.sdk.reportKillClaim(props.player.alias, props.player.target, props.player.passphrase)
                            .then((): void => props.reportUpdate());
                    }} />
            </div>
        </section>);
};
