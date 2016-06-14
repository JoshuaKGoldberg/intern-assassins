const expect = require("chai").expect;
const hooks = require("./hooks");
const World = require("./world");

/**
 * Sample user who will get a kill.
 */
const killer = {
    alias: "killer",
    alive: true,
    nickname: "Killer",
    passphrase: "kill",
    target: "victim"
};

/**
 * Sample user who will be killed.
 */
const victim = {
    alias: "victim",
    alive: true,
    nickname: "Victim",
    passphrase: "dead"
};

/**
 * World for leaderboard feature tests.
 */
class LeadersWorld extends World {
    /**
     * PUTs the sample users (killer and victim) to the server.
     * 
     * @returns {Promise} A promise for adding both users.
     */
    addUsers() {
        this.setUserType("admin");

        return Promise.resolve()
            .then(() => this.sendRequest(
                "PUT",
                "api/users",
                killer))
            .then(() => this.sendRequest(
                "PUT",
                "api/users",
                victim));
    }

    /**
     * PUTs an unconfirmed kill claim to the server.
     * 
     * @returns {Promise} A promise for adding the kill claim.
     */
    addUnconfirmedKillClaim() {
        return this.addUsers()
            .then(() => this.sendRequest(
                "PUT",
                "api/kills",
                {
                    killer: "killer",
                    victim: "victim"
                },
                killer));
    }

    /**
     * PUTs confirmed kill claims to the server.
     * 
     * @returns {Promise} A promise for adding the kill claims.
     */
    addConfirmedKillClaim() {
        return this.addUsers()
            .then(() => this.sendRequest(
                "PUT",
                "api/kills",
                {
                    killer: "killer",
                    victim: "victim"
                },
                killer))
            .then(() => this.sendRequest(
                "PUT",
                "api/kills",
                {
                    killer: "victim",
                    victim: "victim"
                },
                victim));
    }

    /**
     * Asserts the killer and victim were received with no kills.
     */
    assertReceivedNoKills() {
        const users = this.response.body;

        expect(users[0]).to.be.deep.equal(
            {
                alive: true,
                kills: 0,
                nickname: "Killer"
            },
            "The killer has no kills");

        expect(users[1]).to.be.deep.equal(
            {
                alive: true,
                kills: 0,
                nickname: "Victim"
            },
            "The victim has no kills and is still alive");
    }

    /**
     * Asserts the killer and victim were received with one kill
     * for the killer.
     */
    assertReceivedConfirmedKill() {
        const users = this.response.body;

        expect(users[0]).to.be.deep.equal(
            {
                alive: true,
                kills: 1,
                nickname: "Killer"
            },
            "The killer has one kill");

        expect(users[1]).to.be.deep.equal(
            {
                alive: false,
                kills: 0,
                nickname: "Victim"
            },
            "The victim has no kills and is dead");
    }
}

module.exports = function () {
    this.After(hooks.after);
    this.Before(hooks.before);
    this.World = LeadersWorld;
};
