/// <reference path="../../../typings/all.d.ts" />

import { IReport } from "../../shared/actions";
import { Api } from "../api";

/**
 * Stores a single type of data in a database.
 * 
 * @type T   The type of data being stored in reports.
 */
export abstract class StorageMember<T> {
    /**
     * The parent Api using this storage.
     */
    public /* readonly */ api: Api;

    /**
     * Initializes a new instance of the StorageMember class.
     * 
     * @param api   The parent Api using this storage.
     */
    constructor(api: Api) {
        this.api = api;
    }

    /**
     * @param id   Id of a report.
     * @returns A promise for the report with the id.
     */
    public abstract get(id: string): Promise<IReport<T>>;

    /**
     * @param alias   Ids of reports.
     * @returns A promise for the reports with the ids.
     */
    public abstract getMany(aliases: string[]): Promise<IReport<T>[]>;

    /**
     * @returns A promise for all reports.
     */
    public abstract getAll(): Promise<IReport<T>[]>;

    /**
     * Adds a new report to the database.
     * 
     * @param report   A report to add.
     * @returns A promise for the report, if added successfully.
     */
    public abstract put(report: IReport<T>): Promise<IReport<T>>;

    /**
     * Retrieves a unique id for a report.
     * 
     * @param submission   A submission targeting a report.
     * @returns The target alias from the submission.
     */
    public abstract retrieveIdFromRequest(submission: any): string;
}
