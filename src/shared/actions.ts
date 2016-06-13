"use strict";

/**
 * One of the allowed REST methods.
 */
export type Method = "DELETE" | "GET" | "POST" | "PUT";

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
     * The user reporting this action.
     */
    reporter: string;

    /**
     * When the server recognized the action.
     */
    timestamp: number;
}
