const createTestMongoDb = require("./testmongodb");
const promiseTestServer = require("./testserver");

module.exports = {
    after: function () {
        this.mongoCloser();
    },
    before: function (scenario) {
        this.mongoCloser = createTestMongoDb(scenario);
        return promiseTestServer().then(server => {
            server.run();
            this.server = server;
        });
    }
};
