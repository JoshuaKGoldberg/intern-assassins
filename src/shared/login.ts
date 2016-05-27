"use strict";

/**
 * Values used to log in as a user.
 */
export interface ICredentials {
    /**
     * Alias of a user.
     */
    alias: string;

    /**
     * Friendly nickname of a user.
     */
    nickname: string;

    /**
     * Secret passphrase of a user.
     */
    passphrase: string;
}

/**
 * Keys required to exist in login attempt data.
 */
export const CredentialKeys: string[] = ["alias", "nickname", "passphrase"];
