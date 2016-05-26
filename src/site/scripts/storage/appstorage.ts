import { ICredentials } from "../../../shared/login";

/**
 * Client-side storage for login credentials.
 */
export class AppStorage {
    /**
     * Key for retrieving user alias.
     */
    private static /* readonly */ keyAlias: string = "Assassins::Alias";

    /**
     * Key for retrieving user nickname.
     */
    private static /* readonly */ keyNickname: string = "Assassins::Nickname";

    /**
     * Key for retrieving user passphrase.
     */
    private static /* readonly */ keyPassphrase: string = "Assassins::Passphrase";

    /**
     * @returns User alias.
     */
    public get alias(): string {
        return localStorage.getItem(AppStorage.keyAlias);
    }

    /**
     * @param value   A new value for the user's alias.
     */
    public set alias(value: string) {
        localStorage.setItem(AppStorage.keyAlias, value);
    }

    /**
     * @returns User nickname.
     */
    public get nickname(): string {
        return localStorage.getItem(AppStorage.keyNickname);
    }

    /**
     * @param value   A new value for the user's nickname.
     */
    public set nickname(value: string) {
        localStorage.setItem(AppStorage.keyNickname, value);
    }

    /**
     * @returns User passphrase.
     */
    public get passphrase(): string {
        return localStorage.getItem(AppStorage.keyPassphrase);
    }

    /**
     * @param value   A new value for the user's passphrase.
     */
    public set passphrase(value: string) {
        localStorage.setItem(AppStorage.keyPassphrase, value);
    }

    /**
     * Sets stored values to match a user's credentials.
     * 
     * @param values   Known user credentials.
     */
    public setValues(values: ICredentials): void {
        [this.alias, this.nickname, this.passphrase] = [values.alias, values.nickname, values.passphrase];
    }

    /**
     * @returns App storage as user credentials.
     */
    public asCredentials(): ICredentials {
        return {
            alias: this.alias,
            nickname: this.nickname,
            passphrase: this.passphrase
        };
    }

    /**
     * @returns Whether all fields have been filled.
     */
    public isComplete(): boolean {
        return !!(this.alias && this.nickname && this.passphrase);
    }
}

