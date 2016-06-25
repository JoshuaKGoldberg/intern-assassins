"use strict";

const expect = require("chai").expect;
const request = require("request-promise");

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
    admin: function () {
        return userTypeCredentials.admin;
    },
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
    user: function () {
        return userTypeCredentials.user;
    }
};

/**
 * Base world for feature tests, with login and response checking.
 */
module.exports = class World {
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
    }

    /**
     * Gets user credentials to the appropriate lookup.
     * 
     * @param {string} credentialsType
     */
    getCredentials(credentialsType) {
        if (!credentialLookups[credentialsType]) {
            throw new Error(`Unknown credentialsType: '${credentialsType}'.`);
        }

        return credentialLookups[credentialsType].call(this);
    }

    /**
     * Sends a request to the server with credentials.
     * 
     * @param {string} method   Request method, such as "GET".
     * @param {string} endpoint   Server endpoint, such as "api/login".
     * @param {object} [data]   Body data, if any.
     * @param {object} [credentials]   Login credentials, if not `this.credentials`.
     * @returns A promise for the request completing.
     */
    sendRequest(method, endpoint, data, credentials = this.credentials) {
        const options = {
            method: method,
            uri: `http://localhost:${this.server.settings.port}/${endpoint}`,
            body: {
                credentials: credentials,
                data: data
            },
            json: true,
            transform: (_, response) => {
                this.response = response;
            }
        };

        return request(options);
    }

    /**
     * Asserts a code matches what was received by the last request.
     * 
     * @param {string} code   An expected response code.
     */
    assertResponseCode(code) {
        expect(this.response.statusCode.toString()).to.be.equal(code);
    }
};
