/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { ICredentials } from "../../shared/login";
import { IUser } from "../../shared/users";
import { StorageTable } from "./storagetable";

/**
 * Mock database storage for single user operations.
 */
export class UserTable extends StorageTable<IReport<IUser>> {
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
    public get(credentials: ICredentials): Promise<IReport<IUser>> {
        return this.api.users.getSingle(credentials);
    }
}
