"use strict";

const expect = require("chai").expect;
const hooks = require("./hooks");
const World = require("./world");

/**
 * Sample users to add alongside the current user.
 */
const sampleUsers = [
    {
        alias: "aaa",
        codename: "Aaa",
        passphrase: "apple"
    },
    {
        alias: "bbb",
        codename: "Bbb",
        passphrase: "banana"
    }
];

/**
 * World for users endpoint feature tests.
 */
class UsersWorld extends World {
    /**
     * Adds the sample users to the server.
     */
    createSampleUsers() {
        return this.server.api.endpoints.users.importUsers(sampleUsers);
    }

    /**
     * POSTs valid sample user data to the server.
     */
    sendSampleUserDataPost() {
        return this.sendRequest(
            "PUT",
            "api/users",
            sampleUsers)
            .catch(() => {});
    }

    /**
     * POSTS an invalid user to the server.
     */
    sendInvalidUserDataPost() {
        return this.sendRequest(
            "PUT",
            "api/users",
            [{
                "alias": "invalid",
                "codename": "also invalid"
            }])
            .catch(() => {});
    }

    /**
     * Asserts the response body contains sample users and the current user.
     */
    assertAllUsersReceived() {
        this.assertUsersMatchReports(
            [this.credentials, ...sampleUsers],
            this.response.body);
    }

    /**
     * Asserts the sample user from `sendSampleUserDataPost` was created.
     */
    assertSampleUsersCreated() {
        return this.sendRequest("GET", "api/users")
            .then(() => this.assertUsersMatchReports(
                [this.credentials, ...sampleUsers],
                this.response.body))
            .catch(() => {});
    }

    /**
     * Asserts a set of users matches their response reports.
     * 
     * @param expected   The users (expected values).
     * @param actual   Reports on the users (actual received values).
     */
    assertUsersMatchReports(expected, actual) {
        actual = actual.map(user => {
            return {
                alias: user.alias,
                codename: user.codename,
                passphrase: user.passphrase
            };
        });

        this.sortUsers(expected);
        this.sortUsers(actual);

        expect(expected).to.be.deep.equal(actual);
    }

    /**
     * Sorts an array of users.
     * 
     * @param users   An array of users.
     */
    sortUsers(users) {
        users.sort((a, b) => {
            if (a.firstname < b.firstname) {
                return -1;
            }

            if (a.firstname > b.firstname) {
                return 1;
            }

            return 0;
        });
    }
}

module.exports = function () {
    this.After(hooks.after);
    this.Before(hooks.before);
    this.World = UsersWorld;
};
