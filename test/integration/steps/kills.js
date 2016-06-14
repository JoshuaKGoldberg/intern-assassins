const steps = require("./steps");

module.exports = function () {
    steps.call(this);

    this.Given(/^I am a killer$/, function () {
        return this.setUserTypeAsKiller();
    });

    this.When(/^I send a kill claim$/, function () {
        return this.sendKillerKillClaim();
    });

    this.When(/^the victim confirms the kill claim$/, function () {
        return this.sendVictimKillClaim();
    })

    this.When(/^I send an invalid kill claim$/, function () {
        return this.sendInvalidKillClaim();
    });

    this.When(/^I send an unauthorized kill claim$/, function () {
        return this.sendUnauthorizedKillClaim();
    });

    this.Then(/^I should have (.*) kills?$/, function (killsCount) {
        return this.assertKillsCount(parseInt(killsCount));
    });

    this.Then(/^it should have failed as invalid$/, function () {
        this.assertInvalidFailure();
    })

    this.Then(/^it should have failed as unauthorized$/, function () {
        this.assertUnauthorizedFailure();
    })
};
