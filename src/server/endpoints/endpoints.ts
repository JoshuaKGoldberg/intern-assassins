/// <reference path="../../../typings/all.d.ts" />

"use strict";

import { Api } from "../api";
import { Database } from "../database";
import { KillClaimsEndpoint } from "./killclaimsendpoint";
import { NotificationsEndpoint } from "./notificationsendpoint";
import { UserEndpoint } from "./userendpoint";
import { UsersEndpoint } from "./usersendpoint";

/**
 * Bag for API endpoints with a database.
 */
export class Endpoints {
    /**
     * Storage for kill claims.
     */
    public /* readonly */ kills: KillClaimsEndpoint;

    /**
     * Storage for emitted notifications.
     */
    public /* readonly */ notifications: NotificationsEndpoint;

    /**
     * Storage for single user operations.
     */
    public /* readonly */ user: UserEndpoint;

    /**
     * Storage for users.
     */
    public /* readonly */ users: UsersEndpoint;

    /**
     * Routes requests to the appropriate endpoint.
     */
    private api: Api;

    /**
     * Wrapper around a MongoDB database.
     */
    private database: Database;

    /**
     * Initializes a new instance of the Endpoint class.
     * 
     * @param api   Api to route requests.
     */
    public constructor(api: Api, database: Database) {
        this.api = api;
        this.kills = new KillClaimsEndpoint(api, this.database);
        this.notifications = new NotificationsEndpoint(api, this.database);
        this.user = new UserEndpoint(api, this.database);
        this.users = new UsersEndpoint(api, this.database);
    }
}
