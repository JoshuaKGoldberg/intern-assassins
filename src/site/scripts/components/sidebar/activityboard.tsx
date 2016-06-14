/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { Activity } from "./activity";

/**
 * Props for an ActivityBoard component.
 */
export interface IActivityBoardProps {
    /**
     * Display activity messages.
     */
    messages: string[];
}

/**
 * Stateless component for an activity board.
 * 
 * @param props   Props for an ActivityBoard component.
 */
export class ActivityBoard extends React.Component<IActivityBoardProps, void> {
    /**
     * Renders the component.
     * 
     * @returns The rendered compoment.
     */
    public render(): JSX.Element {
        return (
            <section className="activity-bar">
                {this.renderMessages()}
            </section>);
    }

    /**
     * Renders messages, if there are any.
     * 
     * @returns The rendered messages, if any.
     */
    public renderMessages(): JSX.Element |JSX.Element[] {
        if (!this.props.messages.length) {
            return <div className="messages-container no-messages">All is quiet...</div>;
        }

        return (
            <div className="messages-container has-messages">
                {this.props.messages.map(
                    (message: string, i: number): JSX.Element => {
                        return <Activity key={i} message={message} />;
                    })}
            </div>);
    }
}
