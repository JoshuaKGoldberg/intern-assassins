const expect = require("chai").expect;
const hooks = require("./hooks");
const World = require("./world");
const ErrorCause = require("../../../src/shared/errors").ErrorCause;

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
 * World for kill claim feature tests.
 */
class KillsWorld extends World {
    /**
     * 
     */
    setUserTypeAsKiller() {
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
     * 
     */
    sendKillerKillClaim() {
        return this.sendRequest(
            "PUT",
            "api/kills",
            {
                killer: "killer",
                victim: "victim"
            },
            {
                alias: killer.alias,
                nickname: killer.nickname,
                passphrase: killer.passphrase
            });
    }

    /**
     * 
     */
    sendVictimKillClaim() {
        return this.sendRequest(
            "PUT",
            "api/kills",
            {
                killer: "victim",
                victim: "victim"
            });
    }

    /**
     * 
     */
    sendInvalidKillClaim() {
        return this.sendRequest(
            "PUT",
            "api/kills",
            {
                victim: "victim"
            },
            {
                alias: victim.alias,
                nickname: victim.nickname,
                passphrase: victim.passphrase
            })
            .catch(() => {});
    }

    /**
     * 
     */
    sendUnauthorizedKillClaim() {
        return this.sendRequest(
            "PUT",
            "api/kills",
            {
                killer: "killer",
                victim: "victim"
            },
            {
                alias: victim.alias,
                nickname: victim.nickname,
                passphrase: victim.passphrase
            })
            .catch(() => {});
    }

    /**
     * 
     */
    assertKillsCount(count) {
        this.credentials = {
            alias: killer.alias,
            nickname: killer.nickname,
            passphrase: killer.passphrase
        };

        return this.sendRequest("GET", "api/user")
            .then(() => expect(this.response.body.kills).to.be.equal(count));
    }

    /**
     * 
     */
    assertInvalidFailure() {
        expect(this.response.body.cause).to.be.equal(ErrorCause[ErrorCause.MissingFields]);
    }

    /**
     * 
     */
    assertUnauthorizedFailure() {
        expect(this.response.body.cause).to.be.equal(ErrorCause[ErrorCause.IncorrectCredentials]);
    }
}

module.exports = function () {
    this.After(hooks.after);
    this.Before(hooks.before);
    this.World = KillsWorld;
};
