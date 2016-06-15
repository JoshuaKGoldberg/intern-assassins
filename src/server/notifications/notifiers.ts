"use strict";
import { INotification } from "../../shared/notifications";

/**
 * Broadcasts notifications to a recipient.
 */
export interface INotifier {
    /**
     * Receives a notification to be broadcast.
     * 
     * @param notification   A new notification.
     */
    receive(notification: INotification): void;
}
