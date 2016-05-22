/// <reference path="../../typings/all.d.ts" />

import * as express from "express";
import * as http from "http";
import * as fsp from "fs-promise";
import { Api } from "./api";

/**
 * Settings to initialize a new Server.
 */
export interface IServerSettings {
    /**
     * Which port to use, if not the default.
     */
    port?: number;
}

/**
 * Management server for the assassins game.
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
     * Whether the server is currently running.
     */
    private running: boolean = false;

    /**
     * Initializes a new instance of the Server class.
     * 
     * @param settings   User-specified server settings.
     */
    public constructor(settings: IServerSettings) {
        this.settings = this.populateSettings(settings);

        this.app = express();
        this.app.use(express.static("src/site"));
        this.app.use("/node_modules", express.static("node_modules"));

        this.api = new Api(this.app);
        this.server = http.createServer(this.app);
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

    /**
     * Creates a version of user-provided settings with all fields.
     * 
     * @param settings   Original user-supplied server settings.
     * @returns Complete settings based on the user-supplied settings.
     */
    private populateSettings(settings: IServerSettings): IServerSettings {
        return {
            port: settings.port || 3000
        };
    }

    /**
     * Loads a settings file to create a Server.
     * 
     * @param filePath   Settings file path.
     * @returns Promise for a new Server.
     */
    public static createFromFile(filePath: string): Promise<Server> {
        return fsp.readFile(filePath)
            .then((data: Buffer): Server => new Server(JSON.parse(data.toString())))
            .catch((error: Error): void => {
                console.error("Could not create server.");
                console.error(error);
            });
    }
}
