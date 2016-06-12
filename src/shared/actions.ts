"use strict";
import { ICredentials } from "./login";

/**
 * One of the allowed REST methods.
 */
export type Method = "DELETE" | "GET" | "POST" | "PUT";

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
     * Verification for the submitting user.
     */
    credentials: ICredentials;
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
     * The user reporting this action.
     */
    reporter: string;

    /**
     * When the server recognized the action.
     */
    timestamp: number;
}
