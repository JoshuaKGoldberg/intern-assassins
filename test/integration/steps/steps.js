module.exports = function () {
    this.Given(/^I am an? (logged in)?(user|admin)$/, function (_, userType) {
        this.setUserType(userType);
    });

    this.When(/^I send a (DELETE|GET|POST|PUT) request to (\S*)$/, function (method, endpoint) {
        return this.sendRequest(method, endpoint);
    });

    this.Then(/^I should receive an? (.*) response$/, function (code) {
        this.assertResponseCode(code);
    });
};
