/// <reference path="../../../../typings/react/index.d.ts" />
/// <reference path="../../../../typings/react-dom/index.d.ts" />

import * as React from "react";
import { ActivityBar } from "./activitybar/activitybar";
import { Profile } from "./profile/profile";

export interface IAppProps {
    // ...
}

export interface IAppState {
    alias?: string;
}

export class App extends React.Component<IAppProps, IAppState> {
    /**
     * 
     */
    private static keyAlias: string = "Assassins::Alias";

    /**
     * 
     */
    public constructor(props?: IAppProps, context?: any) {
        super(props, context);

        try {
            const alias = localStorage.getItem(App.keyAlias);

            if (alias) {
                this.state = { alias };
            } else {
                this.state = {};
            }
        } catch (error) {
            this.state = {};
            console.error("Error loading state", error);
        }

        // Todo: make a landing page to set & save alias, passphrase
        if (!this.state.alias) {
            this.state.alias = "jogol";
        }

        if (this.state.alias) {
            localStorage.setItem(App.keyAlias, this.state.alias);
        }
    }

    /**
     * 
     */
    public render(): JSX.Element {
        return (
            <div id="app-rendered">
                <Profile alias={this.state.alias} />
                <ActivityBar  />
            </div>);
    }
}
