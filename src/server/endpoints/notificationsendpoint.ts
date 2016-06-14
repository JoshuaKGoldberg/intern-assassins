/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { Endpoint } from "./endpoint";

/**
 * Mock database storage for emitted notifications.
 */
export class NotificationsEndpoint extends Endpoint<string> {
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
    public async storeEmittedMessage(message: string): Promise<string> {
        await this.collection.insertOne(message);
        return message;
    }
}
