const Server = require("../../../src/server/server").Server;
const exec = require("child_process").exec;

/**
 * Whether the mongod process is running.
 */
let runningMongo = false;

/**
 * Scenarios using the mongod process.
 */
const scenariosUsing = new Set();

/**
 * Ensures the mongod process is running.
 * 
 * @param {Scenario} scenario   A scenario to register using mongod.
 * @returns {function} Callback to unregister the scenario from using mongod.
 */
module.exports = scenario => {
    if (!runningMongo) {
        exec("mongod");
    }

    scenariosUsing.add(scenario);

    return () => {
        scenariosUsing.delete(scenario);

        if (scenariosUsing.length === 0) {
            exec(`mongo --eval "use admin; db.shutdownServer();"`);
        }
    };
}
