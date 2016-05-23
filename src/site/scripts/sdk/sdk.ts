import { IReport } from "../../../shared/actions";
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
        return this.sendAjaxRequest("api/login", values);
    }

    /**
     * 
     */
    public getPlayer(alias: string): Promise<IReport<IPlayer>> {
        return this.sendAjaxRequest("api/players", { alias });
    }

    /**
     * 
     */
    private sendAjaxRequest<TData, TResponse>(endpoint: string, data?: TData): Promise<TResponse> {
        const url: string = endpoint + "?" + Object.keys(data)
            .map((key: string): string => `${key}=${encodeURIComponent(data[key])}`)
            .join("&");

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

            request.open("GET", url);
            request.send();
        });
    }
}
