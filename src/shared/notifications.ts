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
     * The user's codename.
     */
    codename: string;

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
     * Reminder to the user to kill someone soon.
     */
    KillReminder,

    /**
     * The user is claiming to have killed someone.
     */
    KillClaimToKiller,

    /**
     * The user is claiming to have killed someone.
     */
    KillClaimToKillerReminder,

    /**
     * Someone is claiming to have killed the user.
     */
    KillClaimToVictim,

    /**
     * Someone is claiming to have killed the user.
     */
    KillClaimToVictimReminder
}
