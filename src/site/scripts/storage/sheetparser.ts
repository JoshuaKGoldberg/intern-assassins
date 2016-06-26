import { ICredentials } from "../../../shared/login";

/**
 * Values to create a new user.
 */
export interface IPartialUser extends ICredentials {
    /**
     * Who this person will be hunting.
     */
    target: string;
}

/**
 * Names of columns from an imported Excel sheet.
 */
interface IColumns {
    /**
     * Name of the alias column.
     */
    alias: string;

    /**
     * Name of the codename column.
     */
    codename: string;

    /**
     * Name of the passphrase column.
     */
    passphrase: string;
}

/**
 * Parses an Excel sheet into users.
 */
export class SheetParser {
    /**
     * Imported Excel sheet.
     */
    private sheet: any;

    /**
     * Names of columns in the sheet.
     */
    private columns: IColumns;

    /**
     * How many rows are in the sheet.
     */
    private height: number;

    /**
     * Initializes a new instance of the SheetParser class.
     * 
     * @param sheet   An imported Excel sheet.
     */
    public constructor(sheet: any) {
        this.sheet = sheet;
        this.columns = {
            alias: this.findColumn(1, "alias"),
            codename: this.findColumn(1, "codename"),
            passphrase: this.findColumn(1, "passphrase")
        };
        this.height = this.calculateHeight();
    }

    /**
     * Collects users from the imported sheet.
     * 
     * @returns Partial users from the sheet.
     */
    public collectUsers(): IPartialUser[] {
        let credentials: ICredentials[] = [];

        for (let row: number = 3; row < this.height; row += 1) {
            credentials.push({
                alias: this.sheet[this.columns.alias + row].v,
                codename: this.sheet[this.columns.codename + row].v,
                passphrase: this.sheet[this.columns.passphrase + row].v,
            });
        }

        credentials.sort(() => Math.random() - 0.5);

        return credentials
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
     * Finds the column headed by a search term.
     * 
     * @param row   Row to search cells within.
     * @param search   Search term for the column.
     */
    private findColumn(row: number | string, search: string): string {
        const start: number = "A".charCodeAt(0);
        const end: number = "Z".charCodeAt(0);
        for (let i: number = start; i < end; i += 1) {
            if (this.sheet[String.fromCharCode(i) + row].v.toLowerCase() === search) {
                return String.fromCharCode(i);
            }
        }
    }

    /**
     * Calculates the maximum height of the sheet.
     * 
     * @returns The maximum height of the sheet.
     */
    private calculateHeight(): number {
        return Math.max(
            ...Object.keys(this.sheet)
                .map((key: string): number => parseInt(key.replace(/^\D+/g, "")))
                .filter((value: number): boolean => !isNaN(value)));
    }
}
