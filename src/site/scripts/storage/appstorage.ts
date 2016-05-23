export interface IPlayerStorage {
    alias?: string;
    passphrase?: string;
}

/**
 * 
 */
export class AppStorage {
    /**
     * 
     */
    private static /* readonly */ keyAlias: string = "Assassins::Alias";

    /**
     * 
     */
    private static /* readonly */ keyPassPhrase: string = "Assassins::Passphrase";

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
    public get passphrase(): string {
        return localStorage.getItem(AppStorage.keyPassPhrase);
    }

    /**
     * 
     */
    public set passphrase(value: string) {
        localStorage.setItem(AppStorage.keyPassPhrase, value);
    }
}

