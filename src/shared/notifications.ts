"use strict";

/**
 * One of the allowed REST methods.
 */
export interface INotification {
    /**
     * What type of action caused the notification.
     */
    cause: NotificationCause;

    /**
     * Friendly description of what happened.
     */
    description: string;

    /**
     * The user's nickname.
     */
    nickname: string;

    /**
     * When the notification occurred on the server.
     */
    timestamp: number;
}

/**
 * Types of actions that can cause a notification.
 */
export enum NotificationCause {
    /**
     * The user has killed someone.
     */
    Kill
}
