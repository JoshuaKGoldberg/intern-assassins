module.exports = function () {
    this.Given(/^I am an? (logged in)?(user|admin)$/, (_, userType) => {
        this.setUserType(userType);
    });

    this.When(/^I send a login request with (.*) credentials$/, credentialsType => {
        return this.sendLoginRequest(this.getCredentials(credentialsType));
    });

    this.Then(/^I should receive a (.*) response$/, code => {
        this.assertResponseCode(code);
    });
};
