"use strict";

import { IClaim, IKill } from "../../../shared/kills";
import { IUpdate, Method } from "../../../shared/actions";
import { ICredentials } from "../../../shared/login";
import { INotification } from "../../../shared/notifications";
import { IRound } from "../../../shared/rounds";
import { ILeader, IUser } from "../../../shared/users";
import { IPartialUser } from "../storage/sheetparser";

/**
 * Parses a request for a type of response.
 * 
 * @param request   A completed XMLHttpRequest.
 * @returns The request's result.
 */
interface IResponseParser<T> {
    (request: XMLHttpRequest): T;
}

/**
 * Wrapper around the server API.
 */
export class Sdk {
    /**
     * Checks whether login information is valid.
     * 
     * @param credentials   The submitting user credentials.
     * @returns A promise for whether the login was accepted.
     */
    public login(credentials: ICredentials): Promise<boolean> {
        return this.sendAjaxRequest(
            "POST",
            "api/login",
            credentials,
            credentials,
            Sdk.parseResponseForOkStatus);
    }

    /**
     * Retrieves a user's information.
     * 
     * @param credentials   The submitting user credentials.
     * @returns A promise for the user.
     */
    public getUser(credentials: ICredentials): Promise<IUser> {
        return this.sendAjaxRequest("GET", "api/user", credentials);
    }

    /**
     * Updates users.
     * 
     * @param credentials   The submitting user credentials.
     * @param update   Description of the update.
     * @returns A promise for completing the updates.
     */
    public postUsers(credentials: ICredentials, updates: IUpdate<ICredentials, ICredentials>[]): Promise<boolean> {
        return this.sendAjaxRequest(
            "POST",
            "api/users",
            credentials,
            updates,
            Sdk.parseResponseForOkStatus);
    }

    /**
     * Retrieves active kill claims on or by the user.
     * 
     * @param credentials   The submitting user credentials.
     * @returns A promise for the user's active kill claims.
     */
    public getClaims(credentials: ICredentials): Promise<IClaim[]> {
        return this.sendAjaxRequest(
            "GET",
            "api/claims",
            credentials,
            {
                $or: [
                    {
                        killer: credentials.alias
                    },
                    {
                        victim: credentials.alias
                    }
                ]
            });
    }

    /**
     * Retrieves active kill claims on or by the user.
     * 
     * @param credentials   The submitting user credentials.
     * @returns A promise for the user's active kill claims.
     */
    public getKills(credentials: ICredentials): Promise<IKill[]> {
        return this.sendAjaxRequest("GET", "api/kills", credentials);
    }

    /**
     * Retrieves all users' information.
     * 
     * @param credentials   The submitting user credentials.
     * @returns A promise for all users.
     */
    public getUsers(credentials: ICredentials): Promise<IUser[]> {
        return this.sendAjaxRequest("GET", "api/users", credentials);
    }

    /**
     * Imports users into the database.
     * 
     * @param credentials   The submitting user credentials.
     * @param users   Users to import.
     * @returns A promise for whether the users were accepted.
     */
    public importUsers(credentials: ICredentials, users: IPartialUser[]): Promise<boolean> {
        return this.sendAjaxRequest(
            "PUT",
            "api/users",
            credentials,
            users,
            Sdk.parseResponseForOkStatus);
    }

    /**
     * Adds a kill claim.
     * 
     * @param credentials   The submitting user credentials.
     * @param alias   The user's alias.
     * @returns A promise for the created claim, if successful.
     */
    public addClaim(credentials: ICredentials, claim: IClaim): Promise<IClaim> {
        return this.sendAjaxRequest(
            "PUT",
            "api/claims",
            credentials,
            claim,
            Sdk.parseResponseForJsonData);
    }

    /**
     * Retrieves user leaderboard information.
     * 
     * @returns A promise for user leaderboard information.
     */
    public getLeaders(): Promise<ILeader[]> {
        return this.sendAjaxRequest(
            "GET",
            "api/leaders");
    }

    /**
     * Retrieves past notification.
     * 
     * @returns A promise for past notifications.
     */
    public getNotifications(): Promise<INotification[]> {
        return this.sendAjaxRequest(
            "GET",
            "api/notifications");
    }

    /**
     * Retrieves all rounds.
     * 
     * @returns A promise for all rounds.
     */
    public getRounds(): Promise<IRound[]> {
        return this.sendAjaxRequest(
            "GET",
            "api/rounds");
    }

    /**
     * Sends an ajax request to the server and parses the response.
     * 
     * @param method   What REST method to use.
     * @param url   The API endpoint locator.
     * @param credentials   User credentials.
     * @param data   Contents of the request.
     * @param parser   What response parser to apply to the request
     *                 (by default, the JSON parser).
     * @returns A promise for the type of response.
     */
    private sendAjaxRequest<TData, TResponse>(
        method: Method,
        url: string,
        credentials?: ICredentials,
        data?: TData,
        parser: IResponseParser<TResponse> = Sdk.parseResponseForJsonData): Promise<TResponse> {
        return new Promise((resolve, reject): void => {
            const request: XMLHttpRequest = new XMLHttpRequest();
            const body: string = JSON.stringify({ credentials, data });

            request.onerror = (event: Event): void => reject(event);
            request.onreadystatechange = (): void => {
                if (request.readyState !== 4) {
                    return;
                }

                try {
                    resolve(parser(request));
                } catch (error) {
                    reject(error);
                }
            };

            if (method === "GET") {
                request.open(method, url + "?body=" + body);
                request.send();
            } else {
                request.open(method, url);
                request.setRequestHeader("content-type", "application/json");
                request.send(body);
            }
        });
    }

    /**
     * Parses a request for whether it was 200 OK.
     * 
     * @param request   A completed XMLHttpRequest.
     * @returns Whether the request was 200 OK.
     */
    private static parseResponseForOkStatus(request: XMLHttpRequest): boolean {
        return request.status === 200;
    }

    /**
     * Parses a request for a type of response.
     * 
     * @param request   A completed XMLHttpRequest.
     * @returns The request's response text as an object.
     */
    private static parseResponseForJsonData<T>(request: XMLHttpRequest): T {
        return JSON.parse(request.responseText);
    }
}
