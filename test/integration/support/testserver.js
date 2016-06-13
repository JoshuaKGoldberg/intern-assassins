const Server = require("../../../src/server/server").Server;
const exec = require("child_process").exec;

/**
 * Base settings for the database.
 */
const baseDatabaseSettings = {
    directory: "interns-test",
    port: 27017
};

/**
 * Base settings for the server.
 */
const baseServerSettings = {
    port: 4000
};

/**
 * Differentiator for an individual scenario's directories and ports.
 */
let increment = -1;

/**
 * Creates a new test server.
 * 
 * @return {Promise<Server>} A promise for a running server.
 */
module.exports = () => {
    increment += 1;

    return Server.createFromSettings({
        database: {
            directory: `${baseDatabaseSettings.directory}-${increment}`,
            port: baseDatabaseSettings.port,
            quiet: true,
            reset: true
        },
        server: {
            port: baseServerSettings.port + increment,
            quiet: true,
            reset: true
        }
    });
}