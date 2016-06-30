import { ICredentials } from "../../../shared/login";

/**
 * A partial user to be imported.
 */
export interface IPartialUser extends ICredentials {
    /**
     * Who this person will be hunting.
     */
    target: string;
}

/**
 * Converts .csv files into import-ready partial users.
 */
export class CsvParser {
    /**
     * Cell data from the original document.
     */
    private cells: string[][];

    /**
     * Initializes a new instance of the CsvParser class.
     * 
     * @param rawData   Raw .csv data.
     */
    public constructor(rawData: string) {
        this.cells = rawData
            .match(/[^\r\n]+/g)
            .map((line: string): string[] => line.split(","));
    }

    /**
     * Transforms the data cells into partial users for importing.
     * 
     * @returns Import-ready partial users.
     */
    public collectUsers(): IPartialUser[] {
        const columnAlias = this.cells[0].indexOf("alias");
        const columnCodename = this.cells[0].indexOf("codename");
        const columnPassphrase = this.cells[0].indexOf("passphrase");

        let credentials: ICredentials[] = this.cells
            .slice(1)
            .map((row: string[]): ICredentials => {
                return {
                    alias: row[columnAlias],
                    codename: row[columnCodename],
                    passphrase: row[columnPassphrase]
                };
            });

        credentials = this.generateUniqueCredentials(credentials);

        return credentials
            .sort(() => Math.random() - 0.5)
            .map((user: ICredentials, i: number): IPartialUser => {
                return {
                    alias: user.alias,
                    codename: user.codename,
                    passphrase: user.passphrase,
                    target: credentials[(i + 1) % credentials.length].alias
                };
            });
    }

    /**
     * Creates a version of credentials with unique aliases and codenames.
     * 
     * @param allCredentials   Raw credentials from input.
     * @returns Credentials with duplicated aliases and unique codenames.
     */
    private generateUniqueCredentials(allCredentials: ICredentials[]): ICredentials[] {
        const usedAliases: { [i: string]: boolean } = {};
        const usedCredentials: { [i: string]: number } = {};

        return allCredentials
            .reverse()
            // Ignore all but the last alias submission (they're reversed)
            .filter((credentials: ICredentials): boolean => {
                const alias: string = credentials.alias;

                if (usedAliases[alias]) {
                    return false;
                }

                usedAliases[alias] = true;
                return true;
            })
            .reverse()
            // Add a (#) to duplicated codenames
            .map((credentials: ICredentials): ICredentials => {
                let codename: string = credentials.codename;

                if (usedAliases[codename]) {
                    usedCredentials[codename] += 1;
                    credentials[codename] += ` (${usedCredentials[codename]})`;
                }

                return credentials;
            });
    }
}
