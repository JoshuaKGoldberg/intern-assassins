/// <reference path="../../../../../typings/react/index.d.ts" />
/// <reference path="../../../../../typings/react-dom/index.d.ts" />

"use strict";
import * as React from "react";
import { IReport } from "../../../../shared/actions";
import { Activity } from "./activity";

export interface IActivityBarProps {
    /**
     * 
     */
    recentReports: IReport<any>[];
}

export const ActivityBar: React.StatelessComponent<IActivityBarProps> = (props: IActivityBarProps): JSX.Element => {
    return (
        <section id="activity-bar">
            {props.recentReports.map(
                (recentReport: IReport<any>, i: number): JSX.Element => {
                    console.log("Rendering", recentReport, i);
                    return <Activity key={i} text={JSON.stringify(recentReport.data)} />;
                })}
        </section>);
};
