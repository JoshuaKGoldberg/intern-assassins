/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { INotification } from "../../../../shared/notifications";
import { Activity } from "./activity";

/**
 * Props for an ActivityBoard component.
 */
export interface IActivityBoardProps {
    /**
     * Recent notifications.
     */
    notifications: INotification[];
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
                {this.renderNotifications()}
            </section>);
    }

    /**
     * Renders notifications, if there are any.
     * 
     * @returns The rendered notifications, if any.
     */
    public renderNotifications(): JSX.Element |JSX.Element[] {
        if (!this.props.notifications.length) {
            return <div className="messages-container no-messages">All is quiet...</div>;
        }

        return (
            <div className="messages-container has-messages">
                {this.props.notifications.map(
                    (notification: INotification, i: number): JSX.Element => {
                        return <Activity key={i} {...notification} />;
                    })}
            </div>);
    }
}
