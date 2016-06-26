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
     * Friendly codename of a user.
     */
    codename: string;

    /**
     * Secret passphrase of a user.
     */
    passphrase: string;
}

/**
 * Keys required to exist in login attempt data.
 */
export const CredentialKeys: string[] = ["alias", "codename", "passphrase"];
