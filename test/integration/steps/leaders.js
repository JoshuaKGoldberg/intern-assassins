"use strict";

const steps = require("./steps");

module.exports = function () {
    steps.call(this);

    this.Given(/^the server has users$/, function () {
        return this.addUsers();
    });

    this.Given(/^the server has users with an unconfirmed kill claim$/, function () {
        return this.addUnconfirmedKillClaim();
    });

    this.Given(/^the server has users with a confirmed kill claim$/, function () {
        return this.addConfirmedKillClaim();
    });

    this.Then(/^I should receive the users with no kills$/, function () {
        return this.assertReceivedNoKills();
    });

    this.Then(/^I should receive the users with the confirmed kill$/, function () {
        return this.assertReceivedConfirmedKill();
    });
};
