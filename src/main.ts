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

(async () => createServerFromFile(settingsFileName))()
    .then((server: Server): void => server.run())
    .catch(error => console.error(`${error}\n:(`));

/**
 * Loads a settings file to create a Server.
 * 
 * @param filePath   Settings file path.
 * @returns Promise for a new Server.
 */
async function createServerFromFile(filePath: string): Promise<Server> {
    const settings: IAssassinsSettings = await fsp.exists(filePath)
        .then(exists => {
            if (!exists) {
                throw new Error(`'${filePath}' not found.\nMake sure you copied '${filePath.replace(".json", ".default.json")}' to '${filePath}'.`);
            }
        })
        .then(() => fsp.readFile(filePath))
        .then((data: Buffer) => JSON.parse(data.toString()));

    const database = await Database.create(settings.database);

    return new Server(settings.server, database);
}
