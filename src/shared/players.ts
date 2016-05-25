"use strict";

import { ILoginValues } from "./login";

/**
 * Database model representation of a player.
 */
export interface IPlayer extends ILoginValues {
    /**
     * Whether the player is currently alive.
     */
    alive: boolean;

    /**
     * Who this person is hunting, if still alive.
     */
    target?: string;
}
