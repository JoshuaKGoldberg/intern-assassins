"use strict";
import { Server } from "./server/server";

/**
 * Path to a settings file storing server settings.
 */
const settingsFileName: string = "assassins.json";

Server.createFromFile(settingsFileName)
    .then((server: Server): void => server.run());
