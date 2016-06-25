"use strict";

const steps = require("./steps.js");

module.exports = function () {
    steps.call(this);

    this.Given(/^the server has a few users$/, function () {
        return this.createSampleUsers();
    });

    this.When(/^I send a PUT request to api\/users with sample user data$/, function () {
        return this.sendSampleUserDataPost();
    });

    this.When(/^I send a PUT request to api\/users with invalid user data$/, function () {
        return this.sendInvalidUserDataPost();
    });

    this.Then(/^I should receive an? (.*) response with all users$/, function (code) {
        this.assertResponseCode(code);
        return this.assertAllUsersReceived();
    });

    this.Then(/^a sample user should have been created$/, function () {
        return this.assertSampleUsersCreated();
    });
};
