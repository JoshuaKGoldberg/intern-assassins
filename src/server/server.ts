/// <reference path="../../typings/all.d.ts" />

"use strict";
import * as express from "express";
import * as fsp from "fs-promise";
import * as http from "http";
import { INotification } from "../shared/notifications";
import { IUser } from "../shared/users";
import { IAssassinsSettings } from "../main";
import { Api } from "./api";
import { Sockets } from "./sockets";
import { Database } from "./database";

/**
 * Settings to initialize a new Server.
 */
export interface IServerSettings {
    /**
     * Administrators to add when resetting the database.
     */
    admins?: IUser[];

    /**
     * Port for the web server.
     */
    port: number;

    /**
     * Whether to skip logging status messages.
     */
    quiet: boolean;

    /**
     * Whether to reset the database history.
     */
    reset?: boolean;

    /**
     * Users to add when resetting the database.
     */
    users?: IUser[];
}

/**
 * Management server for an assassins game.
 */
export class Server {
    /**
     * User-specified server settings.
     */
    public /* readonly */ settings: IServerSettings;

    /**
     * Request router to internal storage.
     */
    public /* readonly */ api: Api;

    /**
     * Running express application responding to requests.
     */
    private app: any;

    /**
     * Running http server routing requests to the app.
     */
    private server: http.Server;

    /**
     * MongoDB database.
     */
    private database: Database;

    /**
     * Real-time push notifications for activity.
     */
    private sockets: Sockets;

    /**
     * Initializes a new instance of the Server class.
     * 
     * @param settings   User-specified server settings.
     * @param database   Wrapper around a MongoDB database.
     */
    /* private */ constructor(settings: IServerSettings, database: Database) {
        this.settings = settings;
        this.database = database;

        this.app = express();
        this.app.use(express.static("src/site"));
        this.app.use("/node_modules", express.static("node_modules"));

        this.api = new Api(this.app, this.database);
        this.server = http.createServer(this.app);
        this.sockets = new Sockets(this.server);

        this.api.registerNotificationCallback(
            (notification: INotification): void => {
                this.sockets.emitNotification(notification);
                this.api.endpoints.notifications.storeEmittedNotification(notification);
            });

    }

    /**
     * Starts the server listening for requests.
     */
    public run(): void {
        if (this.settings.reset) {
            this.database.drop();

            if (this.settings.admins) {
                console.log(`Importing ${this.settings.admins.length} admin(s).`);
                this.api.endpoints.users.importAdmins(this.settings.admins);
            }

            if (this.settings.users) {
                console.log(`Importing ${this.settings.users.length} user(s).`);
                this.api.endpoints.users.importUsers(this.settings.users);
            }
        }

        this.server.listen(
            this.settings.port,
            (): void => {
                if (!this.settings.quiet) {
                    console.log(`Starting listening on port ${this.settings.port}...`);
                }
            });
    }

    /**
     * Creates a server and database from reading a settings file.
     * 
     * @param filePath   Path to the settings file.
     * @returns A promise for a new running server.
     */
    public static async createFromFile(filePath: string): Promise<Server> {
        const settings: IAssassinsSettings = await fsp.exists(filePath)
            .then(exists => {
                if (!exists) {
                    throw new Error(`'${filePath}' not found.\nMake sure you copied '${filePath.replace(".json", ".default.json")}' to '${filePath}'.`);
                }
            })
            .then(() => fsp.readFile(filePath))
            .then((data: Buffer) => JSON.parse(data.toString()));

        return await Server.createFromSettings(settings);
    }

    /**
     * Creates a server and database from a settings object.
     * 
     * @param settings   Settings for the server and database.
     * @returns A promise for a new running server.
     */
    public static async createFromSettings(settings: IAssassinsSettings): Promise<Server> {
        const database = await Database.create(settings.database);
        return new Server(settings.server, database);
    }
}
