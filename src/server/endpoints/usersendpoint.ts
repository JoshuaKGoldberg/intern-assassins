/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { ICredentials } from "../../shared/login";
import { IUser } from "../../shared/users";
import { ErrorCause, ServerError } from "../errors";
import { Endpoint } from "./endpoint";

/**
 * Mock database storage for users.
 * 
 * @todo Use MongoDB...
 */
export class UsersEndpoint extends Endpoint<IReport<IUser>[]> {
    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "users";
    }

    /**
     * Retrieves all users.
     * 
     * @param credentials   Login values for authentication.
     * @returns A promise for all users.
     */
    public get(credentials: ICredentials): Promise<IReport<IUser>[]> {
        return this.validateAdminSubmission(credentials)
            .then(() => this.collection.find().toArray());
    }

    /**
     * Retrieves multiple users.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Aliases of users.
     * @returns A promise for the users with the aliases.
     */
    public async getByAliases(credentials: ICredentials, aliases: string[]): Promise<IReport<IUser>[]> {
        const users = await this.collection
            .find({
                "data.alias": {
                    $in: aliases
                }
            })
            .toArray();

        if (users.length === aliases.length) {
            return Promise.resolve(users);
        }

        const missing: string[] = users
            .map((user: IReport<IUser>): string => user.data.alias)
            .filter((alias: string): boolean => aliases.indexOf(alias) === -1);

        throw new ServerError(ErrorCause.UsersDoNotExist, missing);
    }

    /**
     * Retrieves a user by their credentials.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Alias of a user.
     * @returns A promise for the user with the alias.
     * @remarks This can't call validateUserSubmission, because that calls this.
     */
    public async getByCredentials(credentials: ICredentials): Promise<IReport<IUser>> {
        this.validateCredentials(credentials);

        const user: IReport<IUser> = await this.collection.findOne({
            data: credentials
        });

        if (!user) {
            throw new ServerError(ErrorCause.UserDoesNotExist, credentials.alias);
        }

        return Promise.resolve(user);
    }

    /**
     * Updates a user's information.
     * 
     * @param report   Updated information for a user.
     * @returns A promise for when the user is updated.
     */
    public update(report: IReport<IUser>): Promise<any> {
        return this.collection.updateOne(
            {
                "data.alias": report.data.alias
            },
            report.data);
    }

    /**
     * Adds users as administrators to the database.
     * 
     * @param users   Users to be added as administrators.
     * @returns A promise for adding the users.
     */
    public putAdmins(users: IUser[]): Promise<any> {
        return this.collection.insertMany(
            users.map(
                (user: IUser): IReport<IUser> => {
                    return {
                        data: {
                            admin: true,
                            alias: user.alias,
                            alive: true,
                            biography: user.biography,
                            nickname: user.nickname,
                            passphrase: user.passphrase
                        },
                        reporter: "",
                        timestamp: Date.now()
                    };
                }));
    }
}
