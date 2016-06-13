const expect = require("chai").expect;
const hooks = require("./hooks");
const World = require("./world");

/**
 * Sample users to add alongside the current user.
 */
const sampleUsers = [
    {
        alias: "aaa",
        nickname: "Aaa",
        passphrase: "apple"
    },
    {
        alias: "bbb",
        nickname: "Bbb",
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
            sampleUsers.map(user => {
                return {
                    data: user
                };
            }));
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
                "nickname": "also invalid"
            }]);
    }

    /**
     * Asserts the response body contains sample users and the current user.
     */
    assertAllUsersReceived() {
        this.assertUsersMatch(
            [this.credentials, ...sampleUsers],
            this.response.body);
    }

    /**
     * Asserts the sample user from `sendSampleUserDataPost` was created.
     */
    assertSampleUsersCreated() {
        return this.sendRequest("GET", "api/users")
            .then(actualUsers => this.assertUsersMatch(
                [this.credentials, ...sampleUsers],
                this.response.body));
    }

    assertUsersMatch(expected, actual) {
        actual = actual.map(report => {
            return {
                alias: report.data.alias,
                nickname: report.data.nickname,
                passphrase: report.data.passphrase
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
        })
    }
}

module.exports = function () {
    this.After(hooks.after);
    this.Before(hooks.before);
    this.World = UsersWorld;
};
