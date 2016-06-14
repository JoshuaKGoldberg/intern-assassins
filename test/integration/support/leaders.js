const expect = require("chai").expect;
const hooks = require("./hooks");
const World = require("./world");

const killer = {
    alias: "killer",
    alive: true,
    nickname: "Killer",
    passphrase: "kill",
    target: "victim"
};

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
     * 
     */
    addUsers() {
        this.setUserType("admin");

        return Promise.resolve()
            .then(() => this.sendRequest(
                "PUT",
                "api/users",
                {
                    data: killer
                }))
            .then(() => this.sendRequest(
                "PUT",
                "api/users",
                {
                    data: victim
                }));
    }

    /**
     * 
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
     * 
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
     * 
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
     * 
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
