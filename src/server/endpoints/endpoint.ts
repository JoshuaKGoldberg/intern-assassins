/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { Collection } from "mongodb";
import { IReport, Method } from "../../shared/actions";
import { IUser } from "../../shared/users";
import { CredentialKeys, ICredentials } from "../../shared/login";
import { ErrorCause, ServerError } from "../errors";
import { Api } from "../api";
import { Database } from "../database";

/**
 * Exposes a single type of data from a database.
 * 
 * @type T   The type of data being stored.
 */
export abstract class Endpoint<T> {
    /**
     * The parent Api using this storage.
     */
    public /* readonly */ api: Api;

    /**
     * MongoDB database collection.
     */
    protected collection: Collection;

    /**
     * Initializes a new instance of the StorageMember class.
     * 
     * @param api   The parent Api using this storage.
     * @param database   Wrapper around a MongoDB database.
     */
    constructor(api: Api, database: Database) {
        this.api = api;
        this.collection = database.getCollection(this.getRoute());
    }

    /**
     * @returns Path to this part of the global api.
     */
    public abstract getRoute(): string;

    /**
     * @param credentials   Login values for verification.
     * @param alias   Alias of a user.
     * @returns A promise for the queried data.
     */
    public get(credentials: ICredentials, query: any, response: Express.Response): Promise<T | T[]> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Deletes a piece of data.
     * 
     * @param credentials   Login values for verification.
     * @param data   Data to delete.
     * @returns A promise, if deleted successfully.
     */
    public delete(credentials: ICredentials, query: any, response: Express.Response): Promise<any> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Posts a piece of data.
     * 
     * @param credentials   Login values for verification.
     * @param data   Data to post.
     * @returns A promise for the result, if posted successfully.
     */
    public post(credentials: ICredentials, data: any, response: Express.Response): Promise<T> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Puts a new piece of data.
     * 
     * @param credentials   Login values for verification.
     * @param data   Data to put.
     * @returns A promise for the data, if put successfully.
     */
    public put(credentials: ICredentials, data: any, response: Express.Response): Promise<T> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Routes a request to the appropriate handler.
     * 
     * @param route   The handler method.
     * @param credentials   Login values for verification.
     * @param data   Data to transfer.
     * @returns A promise for the handler's result, if successful.
     */
    public route(method: Method, credentials: ICredentials, data: any, response: Express.Response): Promise<T> {
        switch (method) {
            case "DELETE":
                return this.delete(credentials, data, response);

            case "GET":
                return this.get(credentials, data, response);

            case "POST":
                return this.post(credentials, data, response);

            case "POST":
                return this.put(credentials, data, response);

            default:
                throw new Error(`Unknown route: '${method}'.`);
        }
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
        return this.api.endpoints.users.getByCredentials(credentials)
            .then(storedUser => {
                if (storedUser.data.passphrase !== credentials.passphrase) {
                    throw new ServerError(ErrorCause.IncorrectCredentials);
                }

                return storedUser.data;
            });
    }

    /**
     * Ensures a submission contains the correct passphrase for its admin
     * reporter before wrapping it in a report.
     * 
     * @type T   The type of information being submitted.
     * @param credentials   Login values for authentication.
     * @returns A promise for a submitting admin, if authenticated.
     */
    protected validateAdminSubmission<T>(credentials: ICredentials): Promise<IUser> {
        return this.validateUserSubmission(credentials)
            .then((user: IUser): IUser => {
                if (!user.admin) {
                    throw new ServerError(ErrorCause.NotAuthorized);
                }

                return user;
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
