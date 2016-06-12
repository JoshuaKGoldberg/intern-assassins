module.exports = function () {
    this.Given(/^I am an? (logged in)?(user|admin)$/, function (_, userType) {
        this.setUserType(userType);
    });

    this.When(/^I send a login request with (.*) credentials$/, function (credentialsType) {
        return this.sendLoginRequest(this.getCredentials(credentialsType));
    });

    this.Then(/^I should receive an? (.*) response$/, function (code) {
        this.assertResponseCode(code);
    });
};
