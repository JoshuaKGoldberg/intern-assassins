"use strict";

/**
 * A user claiming to have killed or been killed.
 */
export interface IClaim {
    /**
     * Alias of the killer.
     */
    killer: string;

    /**
     * Alias of the victim.
     */
    victim: string;

    /**
     * When the deed took place.
     */
    timestamp: number;
}

/**
 * A user was killed.
 */
export interface IKill extends IClaim { }
