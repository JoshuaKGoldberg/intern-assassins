"use strict";

/**
 * Intern who's totally getting a Hololens as an intern gift if they win.
 */
export interface IPlayer {
    /**
     * The player's t- alias.
     */
    alias: string;

    /**
     * Whether the player is currently alive.
     */
    alive: boolean;

    /**
     * Hopefully entertaining nickname.
     */
    nickname: string;

    /**
     * "Secret key" for verification.
     */
    passphrase: string;

    /**
     * Who this person is hunting, if still alive.
     */
    target?: string;
}
