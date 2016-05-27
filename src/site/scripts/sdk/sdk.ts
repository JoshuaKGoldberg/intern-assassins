"use strict";

import { IReport } from "../../../shared/actions";
import { IKillClaim } from "../../../shared/kills";
import { ICredentials } from "../../../shared/login";
import { IUser } from "../../../shared/users";

/**
 * One of the allowed REST methods.
 */
type Method = "GET" | "POST" | "PUT";

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
            {
                credentials: credentials,
                data: credentials
            },
            Sdk.parseResponseForOkStatus);
    }

    /**
     * Retrieves a user's information.
     * 
     * @param credentials   The submitting user credentials.
     * @returns A promise for the user.
     */
    public getUser(credentials: ICredentials): Promise<IReport<IUser>> {
        return this.sendAjaxRequest(
            "GET",
            "api/users",
            credentials,
            Sdk.parseResponseForJsonData);
    }

    /**
     * Reports that a user has died.
     * 
     * @param credentials   The submitting user credentials.
     * @param alias   The user's alias.
     * @returns A promise for the created kill claim, if successful.
     */
    public reportKillClaim(credentials: ICredentials, claim: IKillClaim): Promise<IReport<IKillClaim>> {
        return this.sendAjaxRequest(
            "PUT",
            "api/kills",
            {
                credentials: credentials,
                data: claim
            },
            Sdk.parseResponseForJsonData);
    }

    /**
     * Sends an ajax request to the server and parses the response.
     * 
     * @param method   What REST method to use.
     * @param url   The API endpoint locator.
     * @param data   Contents of the request.
     * @param parser   What response parser to apply to the request.
     * @returns A promise for the type of response.
     */
    private sendAjaxRequest<TData, TResponse>(method: Method, url: string, data: TData, parser: IResponseParser<TResponse>): Promise<TResponse> {
        if (method === "GET") {
            url = url + "?" + Object.keys(data)
                .map((key: string): string => `${key}=${encodeURIComponent(data[key])}`)
                .join("&");
        }

        return new Promise((resolve, reject): void => {
            const request: XMLHttpRequest = new XMLHttpRequest();

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

            request.open(method, url);
            request.setRequestHeader("content-type", "application/json");
            request.send(JSON.stringify(data));
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
