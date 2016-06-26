"use strict";
import { INotification } from "../../shared/notifications";
import { INotifier } from "./notifiers";

/**
 * Receives app notifications and distributes to notifiers.
 */
export class NotificationsHub {
    /**
     * Notifiers to receive notifications.
     */
    private notifiers: INotifier[] = [];

    /**
     * Registers a notifier to receive notifications.
     * 
     * @param notifier   A notifier to receive notifications.
     */
    public registerNotifier(notifier: INotifier): void {
        this.notifiers.push(notifier);
    }

    /**
     * Sends a notification through the notifiers.
     * 
     * @param notification   A new notification to broadcast.
     */
    public async notify(notification: INotification): Promise<void> {
        for (const notifier of this.notifiers) {
            await notifier.receive(notification);
        }
    }
}
