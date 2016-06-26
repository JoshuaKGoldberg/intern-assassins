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
     * Key for retrieving user codename.
     */
    private static /* readonly */ keyCodename: string = "Assassins::Codename";

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
     * @returns User codename.
     */
    public get codename(): string {
        return localStorage.getItem(AppStorage.keyCodename);
    }

    /**
     * @param value   A new value for the user's codename.
     */
    public set codename(value: string) {
        localStorage.setItem(AppStorage.keyCodename, value);
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
        [this.alias, this.codename, this.passphrase] = [values.alias, values.codename, values.passphrase];
    }

    /**
     * @returns App storage as user credentials.
     */
    public asCredentials(): ICredentials {
        return {
            alias: this.alias,
            codename: this.codename,
            passphrase: this.passphrase
        };
    }

    /**
     * @returns Whether all fields have been filled.
     */
    public isComplete(): boolean {
        return !!(this.alias && this.codename && this.passphrase);
    }
}
