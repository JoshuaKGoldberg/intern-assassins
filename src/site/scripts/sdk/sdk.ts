"use strict";

import { IReport } from "../../../shared/actions";
import { IKillClaim } from "../../../shared/kills";
import { IAdminValues, ILoginValues } from "../../../shared/login";
import { IPlayer } from "../../../shared/players";

/**
 * One of the allowed REST methods.
 */
type Method = "GET" | "POST" | "PUT";

/**
 * 
 * 
 * @param request
 * @returns
 */
interface IRequestParser<T> {
    (request: XMLHttpRequest): T;
}

/**
 * @todo Use Swagger instead...
 */
export class Sdk {
    /**
     * 
     * 
     * @returns A promise for whether the login was accepted.
     */
    public login(values: ILoginValues): Promise<boolean> {
        return this.sendAjaxRequest(
            "POST",
            "api/login",
            values,
            Sdk.parseResponseForOkStatus);
    }

    /**
     * 
     */
    public loginAdministrator(values: IAdminValues): Promise<boolean> {
        return this.sendAjaxRequest(
            "POST",
            "api/admin",
            values,
            Sdk.parseResponseForOkStatus);
    }

    /**
     * 
     */
    public getPlayer(alias: string, passphrase: string): Promise<IReport<IPlayer>> {
        return this.sendAjaxRequest(
            "GET",
            "api/players",
            { alias, passphrase },
            Sdk.parseResponseForJsonData);
    }

    /**
     * Reports that a player has died.
     * 
     * @param alias   The player's alias.
     */
    public reportKillClaim(killer: string, victim: string, passphrase: string): Promise<IReport<IKillClaim>> {
        return this.sendAjaxRequest(
            "PUT",
            "api/kills",
            {
                data: { killer, victim },
                reporter: killer,
                passphrase
            },
            Sdk.parseResponseForJsonData);
    }

    /**
     * 
     */
    private sendAjaxRequest<TData, TResponse>(method: Method, url: string, data: TData, parser: IRequestParser<TResponse>): Promise<TResponse> {
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
     * 
     */
    private static parseResponseForOkStatus(request: XMLHttpRequest): boolean {
        return request.status === 200;
    }

    /**
     * 
     */
    private static parseResponseForJsonData<T>(request: XMLHttpRequest): T {
        return JSON.parse(request.responseText);
    }
}
