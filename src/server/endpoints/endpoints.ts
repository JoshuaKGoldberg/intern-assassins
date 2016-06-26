/// <reference path="../../../typings/all.d.ts" />

"use strict";

import { Api } from "../api";
import { Database } from "../database";
import { ClaimsEndpoint } from "./claimsendpoint";
import { KillsEndpoint } from "./killsendpoint";
import { LeadersEndpoint } from "./leadersendpoint";
import { LoginEndpoint } from "./loginendpoint";
import { NotificationsEndpoint } from "./notificationsendpoint";
import { UserEndpoint } from "./userendpoint";
import { UsersEndpoint } from "./usersendpoint";

/**
 * Bag for API endpoints with a database.
 */
export class Endpoints {
    /**
     * Endpoint for finalized kills.
     */
    public /* readonly */ claims: ClaimsEndpoint;

    /**
     * Endpoint for kill claims.
     */
    public /* readonly */ kills: KillsEndpoint;

    /**
     * Endpoint for leaders.
     */
    public /* readonly */ leaders: LeadersEndpoint;

    /**
     * Endpoint for logins.
     */
    public /* readonly */ login: LoginEndpoint;

    /**
     * Endpoint for emitted notifications.
     */
    public /* readonly */ notifications: NotificationsEndpoint;

    /**
     * Endpoint for single user user operations.
     */
    public /* readonly */ user: UserEndpoint;

    /**
     * Endpoint for users.
     */
    public /* readonly */ users: UsersEndpoint;

    /**
     * Routes requests to the appropriate endpoint.
     */
    private api: Api;

    /**
     * Initializes a new instance of the Endpoint class.
     * 
     * @param api   Api to route requests.
     */
    public constructor(api: Api, database: Database) {
        this.api = api;
        this.claims = new ClaimsEndpoint(api, database);
        this.kills = new KillsEndpoint(api, database);
        this.leaders = new LeadersEndpoint(api, database);
        this.login = new LoginEndpoint(api, database);
        this.notifications = new NotificationsEndpoint(api, database);
        this.user = new UserEndpoint(api, database);
        this.users = new UsersEndpoint(api, database);
    }
}
