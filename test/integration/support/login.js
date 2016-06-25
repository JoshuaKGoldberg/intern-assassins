"use strict";

const hooks = require("./hooks");
const World = require("./world");

/**
 * World for login feature requests.
 */
class LoginWorld extends World {
    /**
     * Sends a login request.
     * 
     * @param {object} credentials
     */
    sendLoginRequest(credentials) {
        return this.sendRequest("POST", "api/login", credentials)
            .catch(() => {});
    }
}

module.exports = function () {
    this.After(hooks.after);
    this.Before(hooks.before);
    this.World = LoginWorld;
};
