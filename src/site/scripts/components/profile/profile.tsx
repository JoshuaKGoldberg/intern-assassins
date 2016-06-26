/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { IAppUserProps } from "../apps/appuser";
import { Actions } from "./actions";
import { Greeting } from "./greeting";
import { InfoDisplay } from "./infodisplay";
import { KillClaimReports } from "./killclaimreports";

/**
 * Component for a user's profile page.
 */
export class Profile extends React.Component<IAppUserProps, void> {
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

        if (!this.props.user.codename) {
            return (
                <section id="profile" className="loading">
                    loading profile for {this.props.user.codename}...
                </section>);
        }

        return (
            <section id="profile">
                <div className="area greeting-area">
                    <Greeting admin={this.props.user.admin} codename={this.props.user.codename} />
                </div>

                <div className="area info-display-area">
                    <InfoDisplay info="codename" display={this.props.user.codename} />
                    {this.props.user.alive && <InfoDisplay info="target" display={this.props.user.target} />}
                </div>

                <div class="area">
                    <Actions
                        alive={this.props.user.alive}
                        onDeath={(): void => { this.onDeath(); }}
                        onKill={(): void => { this.onKill(); }} />
                </div>

                {this.renderKillClaimReports()}
            </section>);
    }

    /**
     * Renders the user's active kill claim reports, if there are any.
     * 
     * @returns The rendered kill claim reports.
     */
    private renderKillClaimReports(): JSX.Element {
        if (!this.props.claims || !this.props.claims.length) {
            return undefined;
        }

        return (
            <KillClaimReports
                claims={this.props.claims}
                kills={this.props.kills}
                user={this.props.user} />);
    }

    /**
     * Handler for the user reporting their own death.
     * 
     * @returns A promise for the report completing.
     */
    private async onDeath(): Promise<void> {
        await this.props.sdk.addClaim(
            this.props.user,
            {
                killer: this.props.user.alias,
                victim: this.props.user.alias,
                timestamp: Date.now()
            });

        this.props.refreshUserData();
    }

    /**
     * Handler for the user reporting they've scored a kill.
     * 
     * @returns A promise for the report completing.
     */
    private async onKill(): Promise<void> {
        await this.props.sdk.addClaim(
            this.props.user,
            {
                killer: this.props.user.alias,
                victim: this.props.user.target,
                timestamp: Date.now()
            });

        this.props.refreshUserData();
    }
}
