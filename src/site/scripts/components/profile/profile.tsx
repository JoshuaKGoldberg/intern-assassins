/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

import * as React from "react";
import { IPlayer } from "../../../../shared/players";
import { Greeting } from "./greeting";
import { InfoDisplay } from "./infodisplay";

export interface IProfileProps {
    alias: string;
}

export class Profile extends React.Component<IProfileProps, IPlayer> {
    // todo: make reacty
    public state: IPlayer = this.fetchWhomData(this.props.alias);

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
                <div class="area">
                    <Greeting nickname={this.state.nickname} />
                </div>

                <div class="area">
                    <img src={`https://me.microsoft.com/ThumbnailPhoto.ashx?email=${this.props.alias}@microsoft.com`} />
                </div>

                <div class="area">
                    <InfoDisplay info="alias" display={this.props.alias} />
                    <InfoDisplay info="nickname" display={this.state.nickname} editable={true} />
                    <InfoDisplay info="target" display={this.state.target} />
                </div>
            </section>);
    }

    /**
     * 
     * 
     * @remarks http://who/Data/Person/{alias}.xml
     * @remarks https://me.microsoft.com/ThumbnailPhoto.ashx?email={alias}@microsoft.com
     * @todo Fill out...
     */
    private fetchWhomData(alias: string): IPlayer {
        return {
            alias,
            alive: true,
            nickname: "joshypoo",
            passphrase: "satya",
            target: "kkeer"
        };
    }
}
