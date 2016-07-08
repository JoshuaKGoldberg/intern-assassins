"use strict";

import { ICredentials } from "./login";

/**
 * Public leaderboard information on a user.
 */
export interface ILeader {
    /**
     * Whether the user is still alive.
     */
    alive: boolean;

    /**
     * How many kills the user has accomplished.
     */
    kills: number;

    /**
     * A unique friendly codename of the user.
     */
    codename: string;
}

/**
 * Database model representation of a user.
 */
export interface IUser extends ICredentials, ILeader {
    /**
     * Whether this user is an administrator.
     */
    admin?: boolean;

    /**
     * Whether the user is currently alive.
     */
    alive: boolean;

    /**
     * Who this person is hunting, if still alive.
     */
    target?: string;
}

/**
 * Description of how a user field behaves.
 */
export interface IUserField {
    /**
     * Whether the field is locked for editing.
     */
    readonly?: boolean;

    /**
     * Input and storage type.
     */
    type: UserFieldType;
}

/**
 * User fields, keyed by name.
 */
export interface IUserFields {
    [i: string]: IUserField;
}

/**
 * Input and storage type of a user field.
 */
export type UserFieldType = "number" | "string";

/**
 * Visible user fields for administrators.
 */
export const UserFields: IUserFields = {
    alias: {
        readonly: true,
        type: "string"
    },
    codename: {
        type: "string"
    },
    kills: {
        type: "number"
    },
    passphrase: {
        type: "string"
    },
    target: {
        type: "string"
    }
};
