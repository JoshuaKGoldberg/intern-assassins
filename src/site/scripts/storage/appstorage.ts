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
    public get alias(): string {
        return localStorage.getItem(AppStorage.keyAlias);
    }

    /**
     * 
     */
    public set alias(value: string) {
        localStorage.setItem(AppStorage.keyAlias, value);
    }
}
