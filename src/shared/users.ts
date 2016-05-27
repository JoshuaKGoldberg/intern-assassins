"use strict";

import { ICredentials } from "./login";

/**
 * Database model representation of a user.
 */
export interface IUser extends ICredentials {
    /**
     * Whether this user is an administrator.
     */
    admin?: boolean;

    /**
     * Whether the user is currently alive.
     */
    alive: boolean;

    /**
     * Life story, condensed.
     */
    biography: string;

    /**
     * Who this person is hunting, if still alive.
     */
    target?: string;
}

/**
 * Fields to display on admin pages, in order.
 */
export const DisplayFields: string[] = ["alias", "nickname", "alive", "target"];
