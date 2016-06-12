/// <reference path="../../typings/all.d.ts" />

"use strict";
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
    public static create(settings: IDatabaseSettings): Promise<Database> {
        const url = `mongodb://localhost:${settings.port}/${settings.directory}`;

        return new Promise<Database>((resolve, reject) => {
            MongoClient.connect(url, (error: MongoError, db: Db): void => {
                if (error) {
                    throw error;
                }

                console.log(`Connected to database at ${url}.`);
                resolve(new Database(db));
            });
        });
    }
}
