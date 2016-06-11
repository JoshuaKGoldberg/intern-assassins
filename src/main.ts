"use strict";
import * as fsp from "fs-promise";
import { IServerSettings, Server } from "./server/server";
import { Database, IDatabaseSettings } from "./server/database";

/**
 * Settings to initialize the assassins app.
 */
export interface IAssassinsSettings {
    /**
     * Settings for the MongoDB database.
     */
    database: IDatabaseSettings;

    /**
     * Settings for the web server.
     */
    server: IServerSettings;
}

/**
 * Path to a settings file storing server settings.
 */
const settingsFileName: string = "assassins.json";

/**
 * Promise for the server.
 */
const serverPromise: Promise<Server> = (async () => {
    const settings: IAssassinsSettings = await fsp.exists(settingsFileName)
        .then(exists => {
            if (!exists) {
                throw new Error(`'${settingsFileName}' not found.\nMake sure you copied '${settingsFileName.replace(".json", ".default.json")}' to '${settingsFileName}'.`);
            }
        })
        .then(() => fsp.readFile(settingsFileName))
        .then((data: Buffer) => JSON.parse(data.toString()));

    const database = await Database.create(settings.database);
    return new Server(settings.server, database);
})();

serverPromise
    .then((server: Server): void => server.run())
    .catch(error => console.error(`${error}\n:(`));
