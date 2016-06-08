/// <reference path="../../../typings/all.d.ts" />

"use strict";

import { Api } from "../api";
import { KillClaimsEndpoint } from "./killclaimsendpoint";
import { NotificationsEndpoint } from "./notificationsendpoint";
import { UserEndpoint } from "./userendpoint";
import { UsersEndpoint } from "./usersendpoint";

/**
 * Bag for API endpoints.
 */
export class Endpoints {
    /**
     * Routes requests to the appropriate endpoint.
     */
    private api: Api;

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
     * Initializes a new instance of the Endpoint class.
     * 
     * @param api   Api to route requests.
     */
    public constructor(api: Api) {
        this.api = api;
        this.kills = new KillClaimsEndpoint(api);
        this.notifications = new NotificationsEndpoint(api);
        this.user = new UserEndpoint(api);
        this.users = new UsersEndpoint(api);
    }
}
