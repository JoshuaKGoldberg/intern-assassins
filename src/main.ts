"use strict";
import { IServerSettings, Server } from "./server/server";
import { IDatabaseSettings } from "./server/database";

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
export const settingsFilePath: string = "assassins.json";

/**
 * Promise for the server.
 */
export const serverPromise: Promise<Server> = (async () => {
    return Server.createFromFile(settingsFilePath);
})();

serverPromise
    .then((server: Server): void => server.run())
    .catch(error => console.error(`${error}\n:(`));
