/// <reference path="../../typings/all.d.ts" />

"use strict";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as url from "url";
import { IReport, ISubmission } from "../shared/actions";
import { ICredentials, CredentialKeys } from "../shared/login";
import { ServerError } from "./errors";
import { KillClaimsTable } from "./storage/killclaimstable";
import { UsersTable } from "./storage/userstable";
import { StorageTable } from "./storage/storagetable";

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
 * Routes requests to internal storage.
 */
export class Api {
    /**
     * Storage for kill claims.
     */
    public /* readonly */ kills: KillClaimsTable = new KillClaimsTable(this);

    /**
     * Storage for users.
     */
    public /* readonly */ users: UsersTable = new UsersTable(this);

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
    public constructor(app: any) {
        app.use(bodyParser.json());
        app.get("/api", (request: express.Request, response: express.Response): void => {
            response.send("ACK");
        });

        this.registerStorageRoutes(app, this.kills);
        this.registerStorageRoutes(app, this.users);

        app.post("/api/login", (request: express.Request, response: express.Response): void => {
            const credentials: ICredentials = request.body.credentials;

            this.users.get(credentials)
                // Case: user alias exists in the database, does the info match?
                .then(record => {
                    if (
                        credentials.nickname === record.data.nickname
                        && credentials.alias === record.data.alias
                        && credentials.passphrase === record.data.passphrase) {
                        response.sendStatus(200);
                    } else {
                        response.sendStatus(401);
                    }
                })
                // Case: user alias does not exist in the database
                .catch((error: ServerError): void => {
                    response.sendStatus(401);
                });
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
     * @param member   Storage abstraction for the database.
     */
    private registerStorageRoutes(app: any, member: StorageTable<any>): void {
        app.route("/api/" + member.getRoute())
            .get(this.wrapRouteHandler(this.generateGetRoute(member)))
            .delete(this.wrapRouteHandler(this.generateDeleteRoute(member)))
            .post(this.wrapRouteHandler(this.generatePostRoute(member)))
            .put(this.wrapRouteHandler(this.generatePutRoute(member)));
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
     * Generates GET route handling for a storage member.
     * 
     * @param member   A storage member to defer to.
     * @returns A GET route handler.
     */
    private generateGetRoute<TSubmission, TData>(member: StorageTable<TData>): IRouteHandler {
        return (request: express.Request, response: express.Response): void => {
            const submission: ISubmission<TSubmission> = this.parseGetSubmission<TSubmission>(request.url);

            member.get(submission.credentials, submission.data)
                .then((results: TData) => response.json(results));
        };
    }

    /**
     * Generates DELETE route handling for a storage member.
     * 
     * @param member   A storage member to defer to.
     * @returns A DELETE route handler.
     */
    private generateDeleteRoute<TSubmission, TData>(member: StorageTable<TData>): IRouteHandler {
        return (request: express.Request, response: express.Response): void => {
            member.delete(request.body.credentials, request.body.data)
                .then((results: TData) => response.json(results));
        };
    }

    /**
     * Generates POST route handling for a storage member.
     * 
     * @param member   A storage member to defer to.
     * @returns A POST route handler.
     */
    private generatePostRoute<TSubmission, TData>(member: StorageTable<TData>): IRouteHandler {
        return (request: express.Request, response: express.Response): void => {
            member.post(request.body.credentials, request.body.data)
                .then((results: TData) => response.json(results));
        };
    }

    /**
     * Generates PUT route handling for a storage member.
     * 
     * @param member   A storage member to defer to.
     * @returns A PUT route handler.
     */
    private generatePutRoute<TSubmission, TData>(member: StorageTable<TData>): IRouteHandler {
        return (request: express.Request, response: express.Response): void => {
            member.put(request.body.credentials, request.body.data)
                .then((results: TData) => response.json(results));
        };
    }

    /**
     * Parses query parameters out of a GET submission.
     * 
     * @param query   A raw user query.
     * @returns The equivalent user submission, with credentials and data.
     */
    private parseGetSubmission<T>(query: string): ISubmission<T> {
        const queryValues: any = url.parse(query, true).query;
        const credentials: ICredentials = {} as ICredentials;
        const data: T = {} as T;

        for (const loginValueKey of CredentialKeys) {
            credentials[loginValueKey] = queryValues[loginValueKey];
            delete queryValues[loginValueKey];
        }

        for (const dataValueKey in queryValues) {
            data[dataValueKey] = queryValues[dataValueKey];
        }

        return {
            credentials: credentials,
            data: data
        };
    }
}
