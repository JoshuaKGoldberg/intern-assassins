/* tslint:disable */
"use strict";
import { Server } from "./server/server";

(function () {
    if (parseInt(process.version.match(/[0-9]/)[0]) < 6) {
        console.log("Node >=6.0.0 required. You're on '" + process.version + "'.");
        console.log("https://nodejs.org/en/download");
        return;
    }

    /**
     * Path to a settings file storing server settings.
     */
    var settingsFileName: string = "assassins.json";

    Server.createFromFile(settingsFileName)
        .then(function (server: Server): void {
            server.run();
        })
        .catch(function (error) {
            console.error(error, "\n:(");
        });
})();
