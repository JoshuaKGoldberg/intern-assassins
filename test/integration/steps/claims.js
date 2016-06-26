"use strict";

const steps = require("./steps");

module.exports = function () {
    steps.call(this);

    this.Given(/^I am a killer$/, function () {
        return this.setUserTypeAsKiller();
    });

    this.Given(/^I am a victim$/, function () {
        return this.setUserTypeAsVictim();
    });

    this.When(/^I send a kill claim$/, function () {
        return this.sendKillerKillClaim();
    });

    this.When(/^I self-report a kill claim$/, function () {
        return this.sendVictimKillClaim();
    });

    this.When(/^the victim confirms the kill claim$/, function () {
        return this.sendVictimKillClaim();
    });

    this.When(/^I send an invalid kill claim$/, function () {
        return this.sendInvalidKillClaim();
    });

    this.When(/^I send an unauthorized kill claim$/, function () {
        return this.sendUnauthorizedKillClaim();
    });

    this.Then(/^I should be dead?$/, function () {
        return this.assertVictimDeath();
    });

    this.Then(/^I should have (.*) kills?$/, function (killsCount) {
        return this.assertKillerKillsCount(parseInt(killsCount));
    });

    this.Then(/^my killer should have (.*) kills?$/, function (killsCount) {
        return this.assertKillerKillsCount(parseInt(killsCount));
    });

    this.Then(/^it should have failed as invalid$/, function () {
        this.assertInvalidFailure();
    });

    this.Then(/^it should have failed as unauthorized$/, function () {
        this.assertUnauthorizedFailure();
    });
};
