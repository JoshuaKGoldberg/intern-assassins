"use strict";

/**
 * A single round of gameplay.
 */
export interface IRound {
    /**
     * Ending time of the round.
     */
    end: number;

    /**
     * Starting time of the round.
     */
    start: number;
}
