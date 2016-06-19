"use strict";

/**
 * A user claiming to have killed or been killed.
 */
export interface IKillClaim {
    /**
     * Which user became a murderer.
     */
    killer: string;

    /**
     * Rest in potatoes.
     */
    victim: string;

    /**
     * When the deed took place.
     */
    timestamp: number;
}
