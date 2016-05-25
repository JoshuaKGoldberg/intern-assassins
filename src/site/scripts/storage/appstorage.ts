import { ICredentials } from "../../../shared/login";

/**
 * 
 */
export class AppStorage implements ICredentials {
    /**
     * 
     */
    private static /* readonly */ keyAlias: string = "Assassins::Alias";

    /**
     * 
     */
    private static /* readonly */ keyNickname: string = "Assassins::Nickname";

    /**
     * 
     */
    private static /* readonly */ keyPassphrase: string = "Assassins::Passphrase";

    /**
     * 
     */
    public get alias(): string {
        return localStorage.getItem(AppStorage.keyAlias);
    }

    /**
     * 
     */
    public set alias(value: string) {
        localStorage.setItem(AppStorage.keyAlias, value);
    }

    /**
     * 
     */
    public get nickname(): string {
        return localStorage.getItem(AppStorage.keyNickname);
    }

    /**
     * 
     */
    public set nickname(value: string) {
        localStorage.setItem(AppStorage.keyNickname, value);
    }

    /**
     * 
     */
    public get passphrase(): string {
        return localStorage.getItem(AppStorage.keyPassphrase);
    }

    /**
     * 
     */
    public set passphrase(value: string) {
        localStorage.setItem(AppStorage.keyPassphrase, value);
    }

    /**
     * 
     */
    public setValues(values: ICredentials): void {
        [this.alias, this.nickname, this.passphrase] = [values.alias, values.nickname, values.passphrase];
    }

    /**
     * 
     */
    public asObject(): ICredentials {
        return {
            alias: this.alias,
            nickname: this.nickname,
            passphrase: this.passphrase
        };
    }

    /**
     * 
     */
    public isComplete(): boolean {
        return !!(this.alias && this.nickname && this.passphrase);
    }
}

