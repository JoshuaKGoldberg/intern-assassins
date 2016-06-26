"use strict";

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
    codename: "Killer",
    passphrase: "kill",
    target: "victim"
};

/**
 * Sample user who will be killed.
 */
const victim = {
    alias: "victim",
    alive: true,
    codename: "Victim",
    passphrase: "dead"
};

/**
 * World for kill claim feature tests.
 */
class KillsWorld extends World {
    /**
     * Adds the killer and victim to the server.
     * 
     * @returns {Promise} A promise for the users being added.
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
     * Adds the killer and victim to the server.
     * 
     * @returns {Promise} A promise for the users being added.
     */
    setUserTypeAsVictim() {
        return this.setUserTypeAsKiller();
    }

    /**
     * Sends a kill claim as the killer.
     * 
     * @returns {Promise} A promise for the kill claim.
     */
    sendKillerKillClaim() {
        return this.sendRequest(
            "PUT",
            "api/claims",
            {
                killer: "killer",
                victim: "victim"
            },
            {
                alias: killer.alias,
                codename: killer.codename,
                passphrase: killer.passphrase
            });
    }

    /**
     * Sends a kill claim as the victim.
     * 
     * @returns {Promise} A promise for the kill claim.
     */
    sendVictimKillClaim() {
        return this.sendRequest(
            "PUT",
            "api/claims",
            {
                killer: "victim",
                victim: "victim"
            });
    }

    /**
     * Sends an invalid kill claim as the killer.
     * 
     * @returns {Promise} A promise for the kill claim.
     */
    sendInvalidKillClaim() {
        return this.sendRequest(
            "PUT",
            "api/claims",
            {
                victim: "victim"
            },
            {
                alias: victim.alias,
                codename: victim.codename,
                passphrase: victim.passphrase
            })
            .catch(() => {});
    }

    /**
     * Sends an unauthorized kill claim.
     * 
     * @returns {Promise} A promise for the kill claim.
     */
    sendUnauthorizedKillClaim() {
        return this.sendRequest(
            "PUT",
            "api/claims",
            {
                killer: "killer",
                victim: "victim"
            },
            {
                alias: victim.alias,
                codename: victim.codename,
                passphrase: victim.passphrase
            })
            .catch(() => {});
    }

    /**
     * Asserts the current user has the correct number of kills.
     * 
     * @param {number} count   How many kills the user should have.
     * @returns {Promise} A promise for asserting the number of kills.
     */
    assertKillerKillsCount(count) {
        this.credentials = {
            alias: killer.alias,
            codename: killer.codename,
            passphrase: killer.passphrase
        };

        return this.sendRequest("GET", "api/user")
            .then(() => expect(this.response.body.kills).to.be.equal(count));
    }

    /**
     * Asserts the victim is dead.
     * 
     * @returns {Promise} A promise for asserting the number of kills.
     */
    assertVictimDeath() {
        this.credentials = {
            alias: victim.alias,
            codename: victim.codename,
            passphrase: victim.passphrase
        };

        return this.sendRequest("GET", "api/user")
            .then(() => expect(this.response.body.alive).to.be.equal(false));
    }

    /**
     * Asserts the correct failure for an invalid kill claim was received.
     */
    assertInvalidFailure() {
        expect(this.response.body.cause).to.be.equal(ErrorCause[ErrorCause.MissingFields]);
    }

    /**
     * Asserts the correct failure for an unauthorized kill claim was received.
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
