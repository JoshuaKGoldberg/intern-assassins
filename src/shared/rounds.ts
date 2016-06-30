"use strict";

/**
 * JSON-friendly raw description of a round.
 */
export interface IRawRound {
    /**
     * Ending time of the round in "LLLL" date format.
     */
    end: string;

    /**
     * Starting time of the round in "LLLL" date format.
     */
    start: string;

    /**
     * If applicable, a moment.js descriptor of how quickly kills are required.
     */
    timeToKill?: [number, string];
}

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

    /**
     * If applicable, a moment.js descriptor of how quickly kills are required.
     */
    timeToKill?: [number, string];
}
