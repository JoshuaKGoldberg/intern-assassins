const expect = require("chai").expect;
const hooks = require("./hooks");
const World = require("./world");

const killer = {
    alias: "killer",
    alive: true,
    nickname: "Killer",
    passphrase: "kill"
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
        expect(JSON.stringify(this.response.body)).to.deep.equal(JSON.stringify([
            {
                alive: true,
                kills: 0,
                nickname: "Killer"
            },
            {
                alive: true,
                kills: 0,
                nickname: "Victim"
            }
        ]));
    }

    /**
     * 
     */
    assertReceivedConfirmedKill() {
        expect(JSON.stringify(this.response.body)).to.deep.equal(JSON.stringify([
            {
                alive: true,
                kills: 1,
                nickname: "Killer"
            },
            {
                alive: true,
                kills: 0,
                nickname: "Victim"
            }
        ]));
    }
}

module.exports = function () {
    this.After(hooks.after);
    this.Before(hooks.before);
    this.World = LeadersWorld;
};
