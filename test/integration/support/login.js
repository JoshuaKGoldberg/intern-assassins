/**
 * Valid credentials for user types.
 */
const userTypeCredentials = {
    admin: {
        alias: "admin",
        nickname: "Admin",
        passphrase: "pineapple"
    },
    anonymous: {},
    user: {
        alias: "user",
        nickname: "User",
        passphrase: "pineapple"
    }
};

/**
 * Generators for credentials per user type.
 */
const credentialLookups = {
    incorrect: () => {
        return {
            alias: "nope",
            nickname: "nope",
            passphrase: "nope"
        };
    },
    missing: () => {
        return {};
    },
    my: () => userTypeCredentials[this.userType],
};

module.exports = function () {
    /**
     * Sets the user type.
     * 
     * @param {string} userType
     */
    this.setUserType = userType => {
        if (!userTypeCredentials[userType]) {
            throw new Error(`Unknown userType: '${userType}'.`);
        }

        this.userType = userType;
    };

    /**
     * Sets the user credentials to the appropriate lookup.
     * 
     * @param {string} credentialsType
     */
    this.getCredentials = credentialsType => {
        if (!credentialLookups[credentialsType]) {
            throw new Error(`Unknown credentialsType: '${credentialsType}'.`);
        }

        return credentialLookups[credentialsType].call(this);
    };

    /**
     * Sends a login request.
     */
    this.sendLoginRequest = () => {
        // ...
    };

    /**
     * Asserts a code matches what was received by the last request.
     * 
     * @param code   An expected response code.
     */
    this.assertResponseCode = code => {
        // ...
    };
};
