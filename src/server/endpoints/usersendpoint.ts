"use strict";
import { IUpdate } from "../../shared/actions";
import { ErrorCause } from "../../shared/errors";
import { CredentialKeys, ICredentials } from "../../shared/login";
import { IUser } from "../../shared/users";
import { ServerError } from "../errors";
import { Endpoint } from "./endpoint";

/**
 * Mock database storage for users.
 */
export class UsersEndpoint extends Endpoint<IUser> {
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
     * @remarks A user retrieving their own data should use "user/get".
     */
    public async get(credentials: ICredentials): Promise<IUser[]> {
        await this.validateAdminCredentials(credentials);

        return this.getAll();
    }

    /**
     * Updates user fields.
     * 
     * @param credentials   Login values for authentication.
     * @param updates   Descriptions of updates.
     * @returns A promise for the updates completing.
     */
    public async post(credentials: ICredentials, updates: IUpdate<ICredentials, ICredentials>[]): Promise<void> {
        await this.validateAdminCredentials(credentials);
        await Promise.all(
            updates.map(async (update: IUpdate<ICredentials, ICredentials>): Promise<void> => {
                if (update.filter.alias !== update.updated.alias) {
                    throw new ServerError(ErrorCause.NotImplemented, "You can't update a user's alias.");
                }

                await this.collection.updateOne(
                    update.filter,
                    {
                        $set: update.updated
                    });
            }));
    }

    /**
     * Adds users to the database.
     * 
     * @param credentials   Login values for authentication.
     * @param users   Users to add.
     * @returns A promise for adding the users.
     */
    public async put(credentials: ICredentials, users: IUser[]): Promise<any> {
        await this.validateAdminCredentials(credentials);

        if (!(users instanceof Array)) {
            users = [users as any];
        }
        this.validateUsers(users);

        return await this.collection.insertMany(users);
    }

    /**
     * Retrieves all users.
     * 
     * @returns A promise for all users.
     */
    public getAll(): Promise<IUser[]> {
        return this.collection.find().toArray();
    }

    /**
     * Retrieves a user by alias.
     * 
     * @param alias   Alias of the user.
     */
    public async getByAlias(alias: string): Promise<IUser> {
        const user: IUser = await this.collection.findOne({ alias });

        if (!user) {
            throw new Error(`Alias '${alias}' does not exist.`);
        }

        return user;
    }

    /**
     * Retrieves multiple users.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Aliases of users.
     * @returns A promise for the users with the aliases.
     */
    public async getByAliases(aliases: string[]): Promise<IUser[]> {
        const users = await this.collection
            .find({
                alias: {
                    $in: aliases
                }
            })
            .toArray();

        const foundAliases: string[] = users.map((user: IUser): string => user.alias);

        let aliasMissing: boolean = false;
        for (let i: number = 0; i < aliases.length; i += 1) {
            if (foundAliases.indexOf(aliases[i]) === -1) {
                aliasMissing = true;
                break;
            }
        }

        if (!aliasMissing) {
            return Promise.resolve(users);
        }

        const missing: string[] = users
            .filter((user: IUser): boolean => foundAliases.indexOf(user.alias) === -1);

        throw new ServerError(ErrorCause.UsersDoNotExist, missing);
    }

    /**
     * Retrieves a user by their credentials, if they exist.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Alias of a user.
     * @returns A promise for the user with the alias.
     * @remarks This can't call validateUserSubmission, because that calls this.
     */
    public async getByCredentials(credentials: ICredentials): Promise<IUser> {
        await this.validateCredentials(credentials);

        const user: IUser = await this.getByAlias(credentials.alias);
        if (credentials.codename !== user.codename || credentials.passphrase !== user.passphrase) {
            throw new ServerError(ErrorCause.NotAuthorized);
        }

        return user;
    }

    /**
     * Retrieves a user by their codename, if they exist.
     * 
     * @param codename   A user's codename.
     */
    public async getByCodename(codename: string): Promise<IUser> {
        return await this.collection.findOne({ codename });
    }

    /**
     * Updates a user's information.
     * 
     * @param user   Updated information for a user.
     * @returns A promise for when the user is updated.
     */
    public async update(user: IUser): Promise<any> {
        return this.collection.updateOne(
            {
                alias: user.alias
            },
            user);
    }

    /**
     * Retrieves users matching a query.
     * 
     * @param query   A search query on users.
     * @returns A promise for users matching the query.
     */
    public async query(query: any): Promise<IUser[]> {
        return this.collection.find(query).toArray();
    }

    /**
     * Imports users into the database.
     * 
     * @param users   Users to be imported as administrators.
     * @returns A promise for importing the users.
     */
    public importUsers(users: IUser[]): Promise<any> {
        return this.collection.insertMany(
            users.map(
                (user: IUser): IUser => {
                    return {
                        alias: user.alias,
                        alive: true,
                        kills: 0,
                        codename: user.codename,
                        passphrase: user.passphrase,
                        target: user.target
                    };
                }));
    }

    /**
     * Imports users as administrators to the database.
     * 
     * @param users   Users to be imported as administrators.
     * @returns A promise for importing the users.
     */
    public importAdmins(users: IUser[]): Promise<any> {
        return this.collection.insertMany(
            users.map(
                (user: IUser): IUser => {
                    return {
                        admin: true,
                        alias: user.alias,
                        alive: true,
                        kills: 0,
                        codename: user.codename,
                        passphrase: user.passphrase
                    };
                }));
    }

    /**
     * Validates that users have their required fields.
     * 
     * @param users   Users to be added.
     */
    private validateUsers(users: IUser[]): void {
        users.forEach((user: IUser, i: number): void => {
            if (!user) {
                throw new ServerError(ErrorCause.InvalidData, `[${i}]`);
            }

            CredentialKeys.forEach((key: string): void => {
                if (!user[key]) {
                    throw new ServerError(ErrorCause.InvalidData, `[${i}][${key}]`);
                }
            });

            user.alive = true;
            user.kills = user.kills || 0;
        });
    }
}
