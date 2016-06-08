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
     * All known users.
     */
    private /* readonly */ users: IReport<IUser>[] = [
        {
            data: {
                admin: true,
                alias: "jogol",
                alive: true,
                biography: "I like long walks on the beach and Kahlua... and I'm all out of long walks on the beach.",
                nickname: "Joshypoo",
                passphrase: "pineapple",
                target: "kkeer"
            },
            reporter: "jogol",
            timestamp: 1234567
        },
        {
            data: {
                admin: false,
                alias: "kkeer",
                alive: true,
                biography: "Do you know the muffin man?",
                nickname: "KK",
                passphrase: "pineapple",
                target: "cgong"
            },
            reporter: "kkeer",
            timestamp: 1234567
        },
        {
            data: {
                admin: false,
                alias: "cgong",
                alive: true,
                biography: "The muffin man?",
                nickname: "CC",
                passphrase: "pineapple",
                target: "satyan"
            },
            reporter: "cgong",
            timestamp: 1234567
        },
        {
            data: {
                admin: false,
                alias: "satyan",
                alive: true,
                biography: "The muffin man!",
                nickname: "Bae",
                passphrase: "pineapple",
                target: "kkeer"
            },
            reporter: "satyan",
            timestamp: 1234567
        }
    ];

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
            .then(() => this.users);
    }

    /**
     * Retrieves multiple users.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Aliases of users.
     * @returns A promise for the users with the aliases.
     */
    public getByAlias(credentials: ICredentials, aliases: string[]): Promise<IReport<IUser>[]> {
        let unfound: string[];
        const reports: IReport<IUser>[] = aliases.map(
            (alias: string): IReport<IUser> => {
                const userReport: IReport<IUser> = this.users.find(
                    report => report.data.alias === alias);

                if (!userReport) {
                    (unfound || (unfound = [])).push(alias);
                }

                return userReport;
            });

        return new Promise((resolve, reject) => {
            if (unfound && unfound.length > 0) {
                reject(new ServerError(ErrorCause.UsersDoNotExist, unfound));
            } else {
                resolve(reports);
            }
        });
    }

    /**
     * Retrieves a single user.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Alias of a user.
     * @returns A promise for the user with the alias.
     * @remarks This can't call validateUserSubmission, because that calls this.
     */
    public getSingle(credentials: ICredentials): Promise<IReport<IUser>> {
        this.validateCredentials(credentials);

        const user = this.users.find(report => report.data.alias === credentials.alias);

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
    public update(report: IReport<IUser>): Promise<void> {
        const index = this.users.findIndex(
            (checkingReport: IReport<IUser>): boolean => {
                return checkingReport.data.alias === report.data.alias;
            });

        this.users.splice(index, 1);
        this.users.push(report);

        return Promise.resolve();
    }
}
