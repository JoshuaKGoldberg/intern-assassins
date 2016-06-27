/**
 * Common snapped times to delay by.
 */
export enum Delay {
    /**
     * One minute (1000 seconds).
     */
    minute = 1000 * 60,

    /**
     * One hour (60 minutes).
     */
    hour = Delay.minute * 60,

    /**
     * One day (24 hours).
     */
    day = Delay.hour * 24
}
