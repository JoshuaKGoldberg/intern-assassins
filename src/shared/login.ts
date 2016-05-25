"use strict";

/**
 * Values used to log in as a player.
 */
export interface ICredentials {
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
 * Keys required to exist in login attempt data.
 */
export const CredentialKeys: string[] = ["alias", "nickname", "passphrase"];
