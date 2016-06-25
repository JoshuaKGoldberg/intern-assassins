/// <reference path="../../typings/bluebird/index.d.ts" />

"use strict";
import * as Promise from "bluebird";
import { Collection, Db, MongoClient, MongoError } from "mongodb";

/**
 * Settings for the MongoDB database.
 */
export interface IDatabaseSettings {
    /**
     * MongoDB sub-directory.
     */
    directory: string;

    /**
     * Port for the MongoDB database.
     */
    port: number;

    /**
     * Whether to skip logging status messages.
     */
    quiet: boolean;
};

/**
 * Wrapper around a MongoDB database.
 */
export class Database {
    /**
     * MongoDB database instance.
     */
    private db: Db;

    /**
     * Initializes a new instance of the Database class.
     * 
     * @param db MongoDB database instance.
     */
    /* private */ constructor(db: Db) {
        this.db = db;
    }

    /**
     * @param path   Name of a database collection.
     * @returns The database collection under the path.
     */
    public getCollection(name: string): Collection {
        return this.db.collection(name);
    }

    /**
     * Clears the database.
     */
    public drop(): void {
        this.db.dropDatabase();
    }

    /**
     * Asynchronously creates a new instance of the Database class.
     * 
     * @param settings   Settings to connect to a MongoDB database.
     * @returns A new instance of the Database class.
     */
    public static async create(settings: IDatabaseSettings): Promise<Database> {
        const url = `mongodb://localhost:${settings.port}/${settings.directory}`;

        return await new Promise<Database>((resolve, reject) => {
            MongoClient.connect(url, (error: MongoError, db: Db): void => {
                if (error) {
                    throw error;
                }

                if (!settings.quiet) {
                    console.log(`Connected to database at ${url}.`);
                }
                resolve(new Database(db));
            });
        });
    }
}
