"use strict";
import { NotificationsEndpoint } from "../endpoints/notificationsendpoint";
import { INotification } from "../../shared/notifications";
import { INotifier } from "./notifiers";

/**
 * Broadcasts notifications to a notifications endpoint.
 */
export class EndpointNotifier implements INotifier {
    /**
     * Backing notifications endpoint.
     */
    private endpoint: NotificationsEndpoint;

    /**
     * Initializes a new instance of the EndpointNotifier class.
     * 
     * @param httpServer   Backing http server.
     */
    public constructor(endpoint: NotificationsEndpoint) {
        this.endpoint = endpoint;
    }

    /**
     * Broadcasts a notification to the socket.io server.
     * 
     * @param notification   A new notification.
     */
    public receive(notification: INotification): void {
        this.endpoint.receiveNotification(notification);
    }
}
