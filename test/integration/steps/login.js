"use strict";

const steps = require("./steps");

module.exports = function () {
    steps.call(this);

    this.When(/^I send a login request with (.*) credentials$/, function (credentialsType) {
        return this.sendLoginRequest(this.getCredentials(credentialsType));
    });
};
