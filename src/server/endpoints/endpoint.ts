/// <reference path="../../../typings/all.d.ts" />

"use strict";
import * as express from "express";
import { Collection } from "mongodb";
import { Method } from "../../shared/actions";
import { ErrorCause } from "../../shared/errors";
import { IUser } from "../../shared/users";
import { CredentialKeys, ICredentials } from "../../shared/login";
import { NotAuthorizedError, ServerError } from "../errors";
import { Api } from "../api";
import { Database } from "../database";

/**
 * Description of how to update an item.
 * 
 * @type TFilter   How to search for the item.
 * @type TUpdate   How to update the item.
 */
export interface IUpdate<TFilter, TUpdate> {
    /**
     * Filter to search for the item.
     */
    filter: TFilter;

    /**
     * New values for the updated item.
     */
    updated: TUpdate;
}

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
    public get(credentials: ICredentials, query: any, response: express.Response): Promise<T | T[]> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Deletes a piece of data.
     * 
     * @param credentials   Login values for verification.
     * @param data   Data to delete.
     * @returns A promise, if deleted successfully.
     */
    public delete(credentials: ICredentials, query: any, response: express.Response): Promise<any> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Posts a piece of data.
     * 
     * @param credentials   Login values for verification.
     * @param data   Data to post.
     * @returns A promise for the result, if posted successfully.
     */
    public post(credentials: ICredentials, data: any, response: express.Response): Promise<any> {
        throw new ServerError(ErrorCause.NotImplemented);
    }

    /**
     * Puts a new piece of data.
     * 
     * @param credentials   Login values for verification.
     * @param data   Data to put.
     * @returns A promise for the data, if put successfully.
     */
    public put(credentials: ICredentials, data: any, response: express.Response): Promise<T> {
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
    public route(method: Method, credentials: ICredentials, data: any, response: express.Response): Promise<T> {
        switch (method) {
            case "DELETE":
                return this.delete(credentials, data, response);

            case "GET":
                return this.get(credentials, data, response);

            case "POST":
                return this.post(credentials, data, response);

            case "PUT":
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
        if (!credentials) {
            throw new NotAuthorizedError(ErrorCause.MissingFields, CredentialKeys);
        }

        const missingFields: string[] = CredentialKeys.filter(
            (key: string) => typeof credentials[key] === "undefined");

        if (missingFields.length === 0) {
            return;
        }

        throw new NotAuthorizedError(ErrorCause.MissingFields, missingFields);
    }

    /**
     * Ensures a submission contains the correct information for its user.
     * 
     * @type T   The type of information being submitted.
     * @param credentials   Login values for authentication.
     * @returns A promise for a submitting user, if authenticated.
     */
    protected async validateUserCredentials<T>(credentials: ICredentials): Promise<IUser> {
        const storedUser: IUser = await this.api.endpoints.users.getByCredentials(credentials)
            .catch(() => undefined);

        if (!storedUser) {
            throw new NotAuthorizedError(ErrorCause.IncorrectCredentials);
        }
        if (storedUser.passphrase !== credentials.passphrase) {
            throw new NotAuthorizedError(ErrorCause.IncorrectCredentials);
        }

        return storedUser;
    }

    /**
     * Ensures a submission contains the correct information for an admin.
     * 
     * @type T   The type of information being submitted.
     * @param credentials   Login values for authentication.
     * @returns A promise for a submitting admin, if authenticated.
     */
    protected validateAdminCredentials<T>(credentials: ICredentials): Promise<IUser> {
        return this.validateUserCredentials(credentials)
            .then((user: IUser): IUser => {
                if (!user.admin) {
                    throw new NotAuthorizedError(ErrorCause.NotAuthorized);
                }

                return user;
            });
    }
}
