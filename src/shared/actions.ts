"use strict";

/**
 * One of the allowed REST methods.
 */
export type Method = "DELETE" | "GET" | "POST" | "PUT";

/**
 * Description of how to update an item.
 * 
 * @type TFilter   How to search for the item.
 * @type TUpdate   How to update the item.
 */
export interface IUpdate<TFilter, TUpdate> {
    /**
     * Filter to search for the item.
     */
    filter: TFilter;

    /**
     * New values for the updated item.
     */
    updated: TUpdate;
}
