"use strict";

/**
 * Values used to log in as a player.
 */
export interface ILoginValues {
    /**
     * Alias of a player.
     */
    alias: string;

    /**
     * Friendly nickname of a player.
     */
    nickname: string;

    /**
     * Secret passphrase of a player.
     */
    passphrase: string;
}

/**
 * Values used to log in as an administrator.
 */
export interface IAdminValues {
    /**
     * Alias of an admin.
     */
    alias: string;

    /**
     * Secret passphrase of an admin.
     */
    passphrase: string;
}

/**
 * Keys required to exist in login attempt data.
 */
export const LoginValueKeys: string[] = ["alias", "nickname", "passphrase"];
