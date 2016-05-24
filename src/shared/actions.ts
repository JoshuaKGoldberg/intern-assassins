"use strict";

/**
 * A user submission of data, along with their credentials.
 * 
 * @type T   The type of data being submitted.
 */
export interface ISubmission<T> {
    /**
     * Some data being sent in.
     */
    data: T;

    /**
     * The reporter's passphrase, for verification.
     */
    passphrase: string;

    /**
     * Alias of the player sending this in.
     */
    reporter: string;
}

/**
 * A record of a previous submission.
 * 
 * @type T   The type of data being submitted.
 */
export interface IReport<T> {
    /**
     * Some data sent in.
     */
    data: T;

    /**
     * The player reporting this action.
     */
    reporter: string;

    /**
     * When the server recognized the action.
     */
    timestamp: number;
}
