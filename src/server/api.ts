/// <reference path="../../typings/all.d.ts" />

"use strict";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as url from "url";
import { IReport, ISubmission } from "../shared/actions";
import { ILoginValues } from "../shared/login";
import { ErrorCause, ServerError } from "./errors";
import { IAdmin } from "./server";
import { KillStorage } from "./storage/kills";
import { PlayerStorage } from "./storage/players";
import { StorageMember } from "./storage/storage";

export interface IReportCallback<T> {
    (event: IReport<T>): void;
}

/**
 * Handler a received request.
 */
interface IRouteHandler {
    (request: express.Request, response: express.Response): void;
}

/**
 * Routes requests to internal storage.
 */
export class Api {
    /**
     * Fields that must be in all submissions.
     */
    private static /* readonly */ requiredSubmissionFields: string[] = [
        "data", "reporter"
    ];

    /**
     * Storage for kill claims.
     */
    public /* readonly */ kills: KillStorage = new KillStorage(this);

    /**
     * Storage for players.
     */
    public /* readonly */ players: PlayerStorage = new PlayerStorage(this);

    /**
     * Login credentials for server administrators.
     */
    private admins: IAdmin[];

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
    public constructor(app: any, admins: IAdmin[]) {
        this.admins = admins;

        app.use(bodyParser.json());

        this.registerStorageRoutes(app, "/api/kills", this.kills);
        this.registerStorageRoutes(app, "/api/players", this.players);

        app.get("/api", (request: express.Request, response: express.Response): void => {
            response.send("ACK");
        });

        app.post("/api/login", (request: express.Request, response: express.Response): void => {
            const query: ILoginValues = request.body;

            this.players.get(query.alias)
                // Case: player alias exists in the database, does the info match?
                .then(record => {
                    if (
                        query.nickname === record.data.nickname
                        && query.alias === record.data.alias
                        && query.passphrase === record.data.passphrase) {
                        response.sendStatus(200);
                    } else {
                        response.sendStatus(401);
                    }
                })
                // Case: player alias does not exist in the database
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
    private registerStorageRoutes<T>(app: any, route: string, member: StorageMember<T>): void {
        app.route(route)
            .get(this.generateGetRoute(member))
            .put(this.generatePutRoute(member));
    }

    /**
     * Generates GET route handling for a storage member.
     * 
     * @param member   A storage member to defer to.
     * @returns A GET route handler.
     */
    private generateGetRoute<T>(member: StorageMember<T>): IRouteHandler {
        return (request: express.Request, response: express.Response): void => {
            const query: ILoginValues = url.parse(request.url, true).query;

            if (Object.keys(query).length === 0) {
                member.getAll()
                    .then(results => response.json(results))
                    .catch(error => response.sendStatus(500));
            } else {
                member
                    .get(member.retrieveIdFromRequest(query))
                    .then(results => response.json(results))
                    .catch(error => response.sendStatus(500));
            }
        };
    }

    /**
     * Generates GET route handling for a storage member.
     * 
     * @param member   A storage member to defer to.
     * @returns A GET route handler.
     */
    private generatePutRoute<T>(member: StorageMember<T>): IRouteHandler {
        return (request: express.Request, response: express.Response): void => {
            this.validateSubmission<T>(request.body)
                .then(report => member.put(report))
                .then(results => response.json(results))
                .catch(error => response
                    .status(500)
                    .json({
                        error: error.message
                    }));
        };
    }

    /**
     * Ensures a submission contains the correct passphrase for its reporter before
     * wrapping it in a report.
     * 
     * @type T   The type of information being submitted.
     * @param submission   Raw data submission from a user.
     * @returns A promise for a report of the submission.
     */
    private validateSubmission<T>(submission: ISubmission<T>): Promise<IReport<T>> {
        for (const field of Api.requiredSubmissionFields) {
            if (!submission[field]) {
                throw new ServerError(ErrorCause.MissingField, field);
            }
        }

        if (this.isSubmissionFromAdministrator(submission)) {
            return Promise.resolve(this.wrapSubmission(submission));
        }

        return this.players.get(submission.reporter)
            .then(storedPlayer => {
                if (storedPlayer.data.passphrase !== submission.passphrase) {
                    throw new ServerError(ErrorCause.IncorrectCredentials, submission.reporter);
                }

                return this.wrapSubmission(submission);
            });
    }

    /**
     * Checks whether a submission was made by a server administrator.
     * 
     * @param submission   An API submission sent in by a user.
     * @returns Whether the submission was made by a server administrator.
     */
    private isSubmissionFromAdministrator<T>(submission: ISubmission<T>): boolean {
        return !!this.admins.find((admin: IAdmin): boolean => {
            return admin.alias === submission.reporter && admin.passphrase === submission.passphrase;
        });
    }

    /**
     * Standardizes data wrappings around a submission to use it as a report.
     * 
     * @param submission   An API submission sent in by a user.
     * @returns The submission wrapped as a request.
     */
    private wrapSubmission<T>(submission: ISubmission<T>): IReport<T> {
        return {
            data: submission.data,
            reporter: submission.reporter,
            timestamp: Date.now()
        };
    }
}
