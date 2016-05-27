/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { IUser } from "../../shared/users";
import { CredentialKeys, ICredentials } from "../../shared/login";
import { ErrorCause, ServerError } from "../errors";
import { Api } from "../api";

/**
 * Stores a single type of data in a database.
 * 
 * @type T   The type of data being stored.
 */
export abstract class StorageTable<T> {
    /**
     * The parent Api using this storage.
     */
    public /* readonly */ api: Api;

    /**
     * Initializes a new instance of the StorageMember class.
     * 
     * @param api   The parent Api using this storage.
     */
    constructor(api: Api) {
        this.api = api;
    }

    /**
     * @returns Path to this part of the global api.
     */
    public abstract getRoute(): string;

    /**
     * @param credentials   Login values for verification.
     * @param alias   Alias of a user.
     * @returns A promise for the data with the id.
     */
    public get(credentials: ICredentials, query: any): Promise<T> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Deletes a piece of data from the table.
     * 
     * @param credentials   Login values for verification.
     * @param data   Data to delete.
     * @returns A promise, if deleted successfully.
     */
    public delete(credentials: ICredentials, query: any): Promise<any> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Posts a new piece of data to the table.
     * 
     * @param credentials   Login values for verification.
     * @param data   Data to post.
     * @returns A promise for the result, if posted successfully.
     */
    public post(credentials: ICredentials, data: any): Promise<T> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Puts a new piece of data into the table.
     * 
     * @param credentials   Login values for verification.
     * @param data   Data to put.
     * @returns A promise for the data, if put successfully.
     */
    public put(credentials: ICredentials, data: any): Promise<T> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Retrieves a unique id for a submission.
     * 
     * @param submission   A submission targeting a piece of data.
     * @returns The target alias from the submission.
     */
    protected retrieveIdFromRequest(submission: any): string {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Ensures credentials are completely filled out.
     * 
     * @param credentials   Login credentials from a request.
     */
    protected validateCredentials(credentials: ICredentials): void {
        const missingFields: string[] = CredentialKeys.filter(
            (key: string) => typeof credentials[key] === "undefined");

        if (missingFields.length === 0) {
            return;
        }

        throw new ServerError(ErrorCause.MissingFields, missingFields);
    }

    /**
     * Ensures a submission contains the correct passphrase for its reporter before
     * wrapping it in a report.
     * 
     * @type T   The type of information being submitted.
     * @param credentials   Login values for authentication.
     * @returns A promise for a submitting user, if authenticated.
     */
    protected validateUserSubmission<T>(credentials: ICredentials): Promise<IUser> {
        return this.api.users.get(credentials)
            .then(storedUser => {
                if (storedUser.data.passphrase !== credentials.passphrase) {
                    throw new ServerError(ErrorCause.IncorrectCredentials);
                }

                return storedUser.data;
            });
    }

    /**
     * Standardizes data wrappings around data to use it as a report.
     * 
     * @param credentials   Login values for authentication.
     * @param submission   An API submission sent in by a user.
     * @returns The submission wrapped as a request.
     */
    protected wrapSubmission<T>(credentials: ICredentials, data: T): IReport<T> {
        return {
            data: data,
            reporter: credentials.alias,
            timestamp: Date.now()
        };
    }
}
