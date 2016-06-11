/// <reference path="../../typings/all.d.ts" />

"use strict";
import * as bodyParser from "body-parser";
import * as express from "express";
import { IReport } from "../shared/actions";
import { ICredentials } from "../shared/login";
import { Database } from "./database";
import { ServerError } from "./errors";
import { Endpoint } from "./endpoints/endpoint";
import { Endpoints } from "./endpoints/endpoints";

/**
 * Handler for a report being emitted.
 * 
 * @param report   The emitted report.
 */
export interface IReportCallback<T> {
    (report: IReport<T>): void;
}

/**
 * Handler for a received request.
 * 
 * @param request   The received request.
 * @param response   A corresponding response to the request.
 */
interface IRouteHandler {
    (request: express.Request, response: express.Response): void;
}

/**
 * Routes requests to the appropriate endpoint.
 */
export class Api {
    /**
     * Bag for API endpoints.
     */
    public /* readonly */ endpoints: Endpoints;

    /**
     * Callbacks to notify of reports.
     */
    private reportCallbacks: IReportCallback<any>[] = [];

    /**
     * Initializes a new instance of the Api class, registering its routes
     * under the application.
     * 
     * @param app   The container application.
     */
    public constructor(app: any, database: Database) {
        app.use(bodyParser.json());
        app.get("/api", (request: express.Request, response: express.Response): void => {
            response.send("ACK");
        });

        this.endpoints = new Endpoints(this, database);
        this.registerEndpointRoutes(app, this.endpoints.kills);
        this.registerEndpointRoutes(app, this.endpoints.notifications);
        this.registerEndpointRoutes(app, this.endpoints.users);

        app.post("/api/login", async (request: express.Request, response: express.Response) => {
            const credentials: ICredentials = request.body.credentials;

            const record = await this.endpoints.users.getByCredentials(credentials)
                // Case: user alias does not exist in the database
                .catch((error: ServerError): void => {
                    response.sendStatus(401);
                });

            // Case: user alias exists in the database, but the info doesn't match does the info match?
            if (
                credentials.nickname !== record.data.nickname
                || credentials.alias !== record.data.alias
                || credentials.passphrase !== record.data.passphrase) {
                response.sendStatus(401);
            }

            response.sendStatus(200);
        });
    }

    /**
     * Registers a callback to receive updates of events.
     * 
     * @param callback   A callback to receive updates of events.
     */
    public registerReportCallback(callback: IReportCallback<any>): void {
        this.reportCallbacks.push(callback);
    }

    /**
     * Fires all registered callbacks for a new report.
     * 
     * @param report   A new report.
     */
    public fireReportCallback(report: IReport<any>): void {
        this.reportCallbacks.forEach((callback: IReportCallback<any>): void => {
            callback(report);
        });
    }

    /**
     * Registers a storage container under a route.
     * 
     * @app   The container application.
     * @param route   URI component under which the member storage will be available.
     * @param endpoint   Storage abstraction for the database.
     */
    private registerEndpointRoutes(app: any, endpoint: Endpoint<any>): void {
        app.route("/api/" + endpoint.getRoute())
            .delete(this.wrapRouteHandler(this.generateRoute("delete", endpoint)))
            .get(this.wrapRouteHandler(this.generateRoute("get", endpoint)))
            .post(this.wrapRouteHandler(this.generateRoute("post", endpoint)))
            .put(this.wrapRouteHandler(this.generateRoute("put", endpoint)));
    }

    /**
     * Safely wraps a route handler in a try/catch, for pretty 500 responses.
     * 
     * @param request   The received request.
     * @param response   A corresponding response to the request.
     * @returns A wrapped handler for a received request.
     */
    private wrapRouteHandler<TSubmission, TData>(handler: IRouteHandler): IRouteHandler {
        return (request: express.Request, response: express.Response): void => {
            try {
                handler(request, response);
            } catch (error) {
                const details: any = {
                    error: error.message
                };

                if (error instanceof ServerError) {
                    details.information = error.information;
                    details.lifeAdvise = error.lifeAdvise;
                }

                response.status(500).json(details);
            }
        };
    }

    /**
     * Generates route handling for a storage member route.
     * 
     * @param member   A storage member to defer to.
     * @returns A route handler.
     */
    private generateRoute<TSubmission, TData>(route: "delete" | "get" | "post" | "put", member: Endpoint<TData>): IRouteHandler {
        return (request: express.Request, response: express.Response): void => {
            member.route(route, request.body.credentials, request.body.data)
                .then((results: TData) => response.json(results));
        };
    }
}
