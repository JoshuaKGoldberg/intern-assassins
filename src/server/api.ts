/// <reference path="../../typings/all.d.ts" />

"use strict";
import * as bodyParser from "body-parser";
import * as express from "express";
import { Method } from "../shared/actions";
import { ErrorCause } from "../shared/errors";
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
    (report: T): void;
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
        this.registerEndpointRoutes(app, this.endpoints.leaders);
        this.registerEndpointRoutes(app, this.endpoints.login);
        this.registerEndpointRoutes(app, this.endpoints.notifications);
        this.registerEndpointRoutes(app, this.endpoints.user);
        this.registerEndpointRoutes(app, this.endpoints.users);
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
    public fireReportCallback<T>(report: T): void {
        this.reportCallbacks.forEach((callback: IReportCallback<T>): void => {
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
            .delete(this.wrapRouteHandler(this.generateRoute("DELETE", endpoint)))
            .get(this.wrapRouteHandler(this.generateRoute("GET", endpoint)))
            .post(this.wrapRouteHandler(this.generateRoute("POST", endpoint)))
            .put(this.wrapRouteHandler(this.generateRoute("PUT", endpoint)));
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
                this.handleResponseError(request, response, error);
            }
        };
    }

    /**
     * Generates route handling for a storage member route.
     * 
     * @param member   A storage member to defer to.
     * @returns A route handler.
     */
    private generateRoute<TSubmission, TData>(method: Method, member: Endpoint<TData>): IRouteHandler {
        return (request: express.Request, response: express.Response): void => {
            const body: any = this.getBodyFromRequest(request);

            member.route(method, body.credentials, body.data, response)
                .then((results: TData) => response.json(results))
                .catch((error: Error): void => {
                    this.handleResponseError(body, response, error);
                });
        };
    }

    /**
     * Handles an error occurring in a request.
     * 
     * @param request   The triggering express request.
     * @param response   The triggering express response.
     * @param error The triggering error.
     */
    private handleResponseError(request: express.Request, response: express.Response, error: Error): void {
        const details: any = {
            error: error.message
        };
        let errorCode: number;

        if (error instanceof ServerError) {
            details.cause = ErrorCause[error.cause];
            details.information = error.information;
            details.lifeAdvise = error.lifeAdvise;
            errorCode = error.getErrorCode() || 500;
        } else {
            errorCode = 500;
        }

        response.status(errorCode).json(details);
    }

    /**
     * Retrieves a POJO body from a request.
     * 
     * @param request   An Express request.
     * @returns The request's body data (by default, an empty object).
     * @remarks The W3C spec prefers not to have form data in GET requests
     *          so we pass a stringified body in request.query for them.
     */
    private getBodyFromRequest(request: express.Request): any {
        for (const _ in request.body) {
            if (request.body.hasOwnProperty(_)) {
                return request.body;
            }
        }

        const body: string | Object = request.query.body;

        if (typeof body === "string") {
            return JSON.parse(body) || {};
        }

        return body || {};
    }
}
