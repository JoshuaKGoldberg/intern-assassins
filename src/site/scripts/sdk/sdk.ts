import { IReport } from "../../../shared/actions";
import { IKillClaim } from "../../../shared/kills";
import { ILoginValues } from "../../../shared/login";
import { IPlayer } from "../../../shared/players";

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
        return this.sendAjaxRequest("POST", "api/login", values);
    }

    /**
     * 
     */
    public getPlayer(alias: string, passphrase: string): Promise<IReport<IPlayer>> {
        return this.sendAjaxRequest("GET", "api/players", { alias, passphrase });
    }

    /**
     * Reports that a player has died.
     * 
     * @param alias   The player's alias.
     */
    public reportKillClaim(killer: string, victim: string, passphrase: string): Promise<IReport<IKillClaim>> {
        console.log("Reporting kill claim", killer, victim);
        return this.sendAjaxRequest(
            "PUT",
            "api/kills",
            {
                data: { killer, victim },
                reporter: killer,
                passphrase
            });
    }

    /**
     * 
     */
    private sendAjaxRequest<TData, TResponse>(method: "GET" | "POST" | "PUT", url: string, data?: TData): Promise<TResponse> {
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

                let response: TResponse;

                try {
                    response = JSON.parse(request.responseText);
                } catch (error) {
                    reject(error);
                    return;
                }

                resolve(response);
            };

            request.open(method, url);
            request.setRequestHeader("content-type", "application/json");
            request.send(JSON.stringify(data));
        });
    }
}
