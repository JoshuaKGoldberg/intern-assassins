/// <reference path="../../../typings/all.d.ts" />

"use strict";
import { IReport } from "../../shared/actions";
import { ICredentials } from "../../shared/login";
import { IUser } from "../../shared/users";
import { ErrorCause, ServerError } from "../errors";
import { StorageTable } from "./storagetable";

/**
 * Mock database storage for users.
 * 
 * @todo Use MongoDB...
 */
export class UsersTable extends StorageTable<IReport<IUser>> {
    /**
     * All known users.
     */
    private /* readonly */ users: IReport<IUser>[] = [
        {
            data: {
                admin: true,
                alias: "jogol",
                alive: true,
                nickname: "Joshypoo",
                passphrase: "pineapple",
                target: "kkeer"
            },
            reporter: "jogol",
            timestamp: 1234567
        },
        {
            data: {
                alias: "kkeer",
                alive: true,
                nickname: "KK",
                passphrase: "pineapple",
                target: "cgong"
            },
            reporter: "kkeer",
            timestamp: 1234567
        },
        {
            data: {
                alias: "cgong",
                alive: true,
                nickname: "CC",
                passphrase: "pineapple",
                target: "satyan"
            },
            reporter: "cgong",
            timestamp: 1234567
        },
        {
            data: {
                alias: "satyan",
                alive: true,
                nickname: "Bae",
                passphrase: "pineapple",
                target: "jogol"
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
     * Retrieves a user.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Alias of a user.
     * @returns A promise for the user with the alias.
     * @remarks This can't call validateUserSubmission, because that calls this.
     */
    public get(credentials: ICredentials): Promise<IReport<IUser>> {
        this.validateCredentials(credentials);

        const user = this.users.find(report => report.data.alias === credentials.alias);

        if (!user) {
            throw new ServerError(ErrorCause.UserDoesNotExist, credentials.alias);
        }

        return Promise.resolve(user);
    }

    /**
     * Retrieves multiple users.
     * 
     * @param credentials   Login values for authentication.
     * @param alias   Aliases of users.
     * @returns A promise for the users with the aliases.
     */
    public getMany(credentials: ICredentials, aliases: string[]): Promise<IReport<IUser>[]> {
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
     * Retrieves a unique alias for a user.
     * 
     * @param submission   A submission targeting a user.
     * @returns The target id (alias) from the submission.
     */
    public retrieveIdFromRequest(submission: any): string {
        return submission.alias;
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
