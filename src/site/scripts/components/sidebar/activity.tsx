/// <reference path="../../../../../typings/moment/index.d.ts" />
/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as Moment from "moment";
import * as React from "react";
import { INotification } from "../../../../shared/notifications";

/**
 * Stateless component for an activity message.
 * 
 * @param props   Props for an Activity component.
 * @returns The rendered compoment.
 */
export const Activity: React.StatelessComponent<INotification> = (props: INotification): JSX.Element => {
    return (
        <div className="activity">
            <div className="activity-description">{props.description}</div>
            <div className="activity-time">{Moment(props.timestamp).fromNow()}</div>
        </div>);
};
