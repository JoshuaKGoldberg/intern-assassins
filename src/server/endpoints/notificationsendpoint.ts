/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { INotification } from "../../shared/notifications";
import { ICredentials } from "../../shared/login";
import { Endpoint } from "./endpoint";

/**
 * Mock database storage for emitted notifications.
 */
export class NotificationsEndpoint extends Endpoint<INotification> {
    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "notifications";
    }

    /**
     * Retrieves all notifications in descending chronological order.
     * 
     * @param credentials   Login values for authentication.
     * @returns A promise for notifications in descending chronological order.
     */
    public async get(credentials: ICredentials): Promise<INotification[]> {
        return (await this.collection.find().toArray())
            .sort((a: INotification, b: INotification): number => {
                return a.timestamp - b.timestamp;
            });
    }

    /**
     * Stores an emitted message in the database.
     * 
     * @param message   The emitted message.
     * @param report   An associated report.
     * @returns A newly generated report for the message.
     */
    public async storeEmittedNotification(notification: INotification): Promise<void> {
        await this.collection.insertOne(notification);
    }
}
