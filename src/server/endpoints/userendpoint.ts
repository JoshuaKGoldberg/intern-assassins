/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { ICredentials } from "../../shared/login";
import { IUser } from "../../shared/users";
import { Endpoint } from "./endpoint";

/**
 * Endpoint for retrieving a single user's information.
 */
export class UserEndpoint extends Endpoint<IUser> {
    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "user";
    }

    /**
     * Retrieves a user.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Alias of a user.
     * @returns A promise for the user with the alias.
     */
    public get(credentials: ICredentials): Promise<IUser> {
        return this.api.endpoints.users.getByCredentials(credentials);
    }
}
