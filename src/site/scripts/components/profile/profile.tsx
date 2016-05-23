/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

import * as React from "react";
import { IReport } from "../../../../shared/actions";
import { IPlayer } from "../../../../shared/players";
import { Sdk } from "../../sdk/sdk";
import { Actions } from "./actions";
import { Greeting } from "./greeting";
import { InfoDisplay } from "./infodisplay";

/**
 * 
 */
export interface IProfileProps {
    /**
     * 
     */
    alias: string;

    /**
     * 
     */
    sdk: Sdk;
}

/**
 * 
 */
export class Profile extends React.Component<IProfileProps, IPlayer> {
    /**
     * 
     */
    public constructor(props?: IProfileProps, context?: any) {
        super(props, context);

        props.sdk.getPlayer(props.alias).then((report: IReport<IPlayer>) => this.setState(report.data));
    }

    /**
     * 
     */
    public render(): JSX.Element {
        if (!this.state) {
            return (
                <section id="profile" className="loading">
                    loading profile...
                </section>);
        }

        if (!this.state.nickname) {
            return (
                <section id="profile" className="loading">
                    loading profile for {this.state.nickname}...
                </section>);
        }

        return (
            <section id="profile">
                <div className="area greeting-area">
                    <Greeting nickname={this.state.nickname} />
                </div>

                <div className="area profile-picture-area">
                    <img src={`https://me.microsoft.com/ThumbnailPhoto.ashx?email=${this.state.alias}@microsoft.com`} />
                </div>

                <div className="area info-display-area">
                    <InfoDisplay info="alias" display={this.state.alias} />
                    <InfoDisplay info="nickname" display={this.state.nickname} editable={true} />
                    <InfoDisplay info="target" display={this.state.target} />
                </div>

                <div class="area">
                    <Actions
                        alive={this.state.alive}
                        onDeath={(): void => this.onDeath()}
                        onKill={(): void => this.onKill()} />
                </div>
            </section>);
    }

    /**
     * 
     */
    private onDeath(): void {
        console.log("You say you died...");
    }

    /**
     * 
     */
    private onKill(): void {
        console.log("Another kill for you!");
    }
}
