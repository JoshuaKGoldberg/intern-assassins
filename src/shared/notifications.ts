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
     * The user has died.
     */
    Death,

    /**
     * The user has killed someone.
     */
    Kill,

    /**
     * The user is claiming to have killed someone.
     */
    KillClaimToKiller,

    /**
     * Someone is claiming to have killed the user.
     */
    KillClaimToVictim
}
