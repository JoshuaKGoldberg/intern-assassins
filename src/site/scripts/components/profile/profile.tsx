/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { IAppLoggedInProps } from "../apps/apploggedin";
import { Actions } from "./actions";
import { Greeting } from "./greeting";
import { InfoDisplay } from "./infodisplay";

/**
 * Component for a user's profile page.
 */
export class Profile extends React.Component<IAppLoggedInProps, void> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        if (!this.props.user) {
            return (
                <section id="profile" className="loading">
                    loading profile...
                </section>);
        }

        if (!this.props.user.nickname) {
            return (
                <section id="profile" className="loading">
                    loading profile for {this.props.user.nickname}...
                </section>);
        }

        return (
            <section id="profile">
                <div className="area greeting-area">
                    <Greeting admin={this.props.user.admin} nickname={this.props.user.nickname} />
                </div>

                <div className="area info-display-area">
                    <InfoDisplay info="alias" display={this.props.user.alias} />
                    <InfoDisplay info="nickname" display={this.props.user.nickname} editable={true} />
                    <InfoDisplay info="target" display={this.props.user.target} />
                </div>

                <div class="area">
                    <Actions
                        alive={this.props.user.alive}
                        onDeath={(): void => this.onDeath()}
                        onKill={(): void => this.onKill()} />
                </div>
            </section>);
    }

    /**
     * Handler for the user reporting their own death.
     */
    private onDeath(): void {
        this.props.sdk.reportKillClaim(
            this.props.user,
            {
                killer: this.props.user.alias,
                victim: this.props.user.alias
            });
    }

    /**
     * Handler for the user reporting they've scored a kill.
     */
    private onKill(): void {
        this.props.sdk.reportKillClaim(
            this.props.user,
            {
                killer: this.props.user.alias,
                victim: this.props.user.target
            });
    }
}
