/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { Endpoint } from "./endpoint";

/**
 * Mock database storage for emitted notifications.
 */
export class NotificationsEndpoint extends Endpoint<IReport<string>> {
    /**
     * All known messages.
     */
    private messages: IReport<string>[] = [];

    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "messages";
    }

    /**
     * Stores an emitted message in the database.
     * 
     * @param message   The emitted message.
     * @param report   An associated report.
     * @returns A newly generated report for the message.
     */
    public storeEmittedMessage(message: string, report: IReport<any>): IReport<string> {
        const messageReport = {
            data: message,
            reporter: report.reporter,
            timestamp: report.timestamp
        };

        this.messages.push(messageReport);

        return messageReport;
    }
}
