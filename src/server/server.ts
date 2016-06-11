/// <reference path="../../typings/all.d.ts" />

"use strict";
import * as express from "express";
import * as http from "http";
import { IReport } from "../shared/actions";
import { Api } from "./api";
import { Sockets } from "./sockets";
import { Database } from "./database";

/**
 * Settings to initialize a new Server.
 */
export interface IServerSettings {
    /**
     * Port for the web server.
     */
    port: number;
}

/**
 * Management server for an assassins game.
 */
export class Server {
    /**
     * Running express application responding to requests.
     */
    private app: any;

    /**
     * User-specified server settings.
     */
    private settings: IServerSettings;

    /**
     * Running http server routing requests to the app.
     */
    private server: http.Server;

    /**
     * Request router to internal storage.
     */
    private api: Api;

    /**
     * MongoDB database.
     */
    private database: Database;

    /**
     * Real-time push notifications for activity.
     */
    private sockets: Sockets;

    /**
     * Whether the server is currently running.
     */
    private running: boolean = false;

    /**
     * Initializes a new instance of the Server class.
     * 
     * @param settings   User-specified server settings.
     */
    public constructor(settings: IServerSettings, database: Database) {
        this.settings = settings;
        this.database = database;

        this.app = express();
        this.app.use(express.static("src/site"));
        this.app.use("/node_modules", express.static("node_modules"));

        this.api = new Api(this.app, this.database);
        this.server = http.createServer(this.app);
        this.sockets = new Sockets(this.server);

        this.api.registerReportCallback(
            (report: IReport<any>) => {
                const message: string = report.data.killer === report.data.victim
                    ? `${report.data.victim} appears to be dead...`
                    : `${report.data.killer} killed ${report.data.victim}!`;

                this.sockets.emit(message);
                this.api.endpoints.notifications.storeEmittedMessage(message, report);
            });
    }

    /**
     * Starts listening for requests.
     */
    public run(): void {
        if (this.running) {
            throw new Error("Server is already running!");
        }

        this.server.listen(
            this.settings.port,
            (): void => console.log(`Starting listening on port ${this.settings.port}...`));

        this.running = true;
    }
}
