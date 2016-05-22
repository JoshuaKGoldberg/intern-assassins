"use strict";
import { Server } from "./server/server";

const fileName = "assassins.json";

Server.createFromFile(fileName)
    .then((server: Server): void => server.run());
