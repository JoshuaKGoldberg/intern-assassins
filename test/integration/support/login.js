const expect = require("chai").expect;
const request = require("request-promise");
const createTestMongoDb = require("./testmongodb");
const promiseTestServer = require("./testserver");

/**
 * Valid credentials for user types.
 */
const userTypeCredentials = {
    admin: {
        alias: "admin",
        nickname: "Admin",
        passphrase: "pineapple"
    },
    anonymous: {},
    user: {
        alias: "user",
        nickname: "User",
        passphrase: "pineapple"
    }
};

/**
 * Generators for credentials per user type.
 */
const credentialLookups = {
    incorrect: function () {
        return {
            alias: "nope",
            nickname: "nope",
            passphrase: "nope"
        };
    },
    missing: function () {
        return {};
    },
    my: function () {
        return userTypeCredentials[this.userType];
    },
};

/**
 * World for testing login actions.
 */
class LoginWorld {
    /**
     * Sets the user type.
     * 
     * @param {string} userType
     */
    setUserType(userType) {
        if (!userTypeCredentials[userType]) {
            throw new Error(`Unknown userType: '${userType}'.`);
        }

        this.userType = userType;
        this.credentials = userTypeCredentials[userType];

        if (userType === "user") {
            return this.server.api.endpoints.users.importUsers([this.credentials]);
        }

        if (userType === "admin") {
            return this.server.api.endpoints.users.importAdmins([this.credentials]);
        }
    };

    /**
     * Sets the user credentials to the appropriate lookup.
     * 
     * @param {string} credentialsType
     */
    getCredentials(credentialsType) {
        if (!credentialLookups[credentialsType]) {
            throw new Error(`Unknown credentialsType: '${credentialsType}'.`);
        }

        return credentialLookups[credentialsType].call(this);
    };

    /**
     * Sends a login request.
     * 
     * @param {object} credentials
     */
    sendLoginRequest(credentials) {
        const options = {
            method: "POST",
            uri: `http://localhost:${this.server.settings.port}/api/login`,
            body: {
                credentials: credentials,
                data: credentials
            },
            json: true,
            transform: (_, response) => {
                this.response = response;
            }
        };

        return request(options).catch(function () {});
    };

    /**
     * Asserts a code matches what was received by the last request.
     * 
     * @param {string} code   An expected response code.
     */
    assertResponseCode(code) {
        expect(this.response.statusCode.toString()).to.be.equal(code);
    };
}

module.exports = function () {
    this.Before(function (scenario) {
        this.mongoCloser = createTestMongoDb(scenario);
        return promiseTestServer().then(server => {
            server.run();
            this.server = server;
        });
    });

    this.After(function () {
        this.mongoCloser();
    });

    this.World = LoginWorld;
};
