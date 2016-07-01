"use strict";
import { ErrorCause } from "../../shared/errors";
import { IKill } from "../../shared/kills";
import { NotificationCause } from "../../shared/notifications";
import { IUser } from "../../shared/users";
import { ServerError } from "../errors";
import { ICredentials } from "../../shared/login";
import { Delay } from "../cron/delays";
import { Endpoint } from "./endpoint";

/**
 * Endpoint for finalized kills.
 */
export class KillsEndpoint extends Endpoint<IKill> {
    /**
     * @returns Path to this part of the global api.
     */
    public getRoute(): string {
        return "kills";
    }

    /**
     * Retrieves kills.
     * 
     * @param credentials   Login values for authentication.
     * @param query   A filter on the kills.
     * @returns Filtered kills.
     * @remarks It would be more efficient to modify the filter for non-admin
     *          users, rather than the post-query results...
     */
    public async get(credentials: ICredentials, query: any): Promise<IKill[]> {
        const user: IUser = await this.validateUserCredentials(credentials);
        let kills: IKill[] = await this.collection.find(query).toArray();

        // Regular users only care about reports of their kills or deaths
        if (!user.admin) {
            kills = kills.filter((kill: IKill): boolean => {
                return user.alias === kill.killer || user.alias === kill.victim;
            });
        }

        return kills;
    }

    /**
     * Adds a kill to the database.
     * 
     * @param credentials   Login values for authentication.
     * @param kills   Kill to add.
     * @returns A promise for adding the kill.
     */
    public async put(credentials: ICredentials, kill: IKill): Promise<IKill> {
        await this.validateAdminCredentials(credentials);

        const victim: IUser = await this.api.endpoints.users.getByAlias(kill.victim);

        await this.finalizeDeath(victim);
        return kill;
    }

    /**
     * Adds a kill to the database.
     * 
     * @param victim   The victim being killed.
     * @returns A promise for adding the kill.
     */
    public async finalizeDeath(victim: IUser): Promise<void> {
        const killer: IUser = (await this.api.endpoints.users.query({
            target: victim.alias
        }))[0];

        if (!killer) {
            throw new ServerError(ErrorCause.Unknown, JSON.stringify(victim));
        }

        // Update the killer: add a kill and set the target to the victim's
        killer.kills += 1;
        killer.target = victim.target;
        await this.api.endpoints.users.update(killer);

        // Update the victim: no longer alive with a target or any claims
        victim.alive = false;
        victim.target = "";
        await this.api.endpoints.users.update(victim);
        await this.api.endpoints.claims.deleteClaimsWith(victim);

        await this.api.fireNotificationCallbacks({
            cause: NotificationCause.Kill,
            description: `${killer.codename} has scored a kill!`,
            codename: killer.codename,
            timestamp: Date.now()
        });

        await this.api.fireNotificationCallbacks({
            cause: NotificationCause.Death,
            description: `Oh no! ${victim.codename} died!`,
            codename: victim.codename,
            timestamp: Date.now()
        });

        this.api.scheduler.delayChain({
            [Delay.day * 1.5]: async (): Promise<boolean> => {
                const futureKiller: IUser = await this.api.endpoints.users.getByAlias(killer.alias);
                if (futureKiller.kills !== killer.kills) {
                    return true;
                }

                await this.api.fireNotificationCallbacks({
                    cause: NotificationCause.KillReminder,
                    description: "You haven't killed in a while. Get on it soon, or we'll auto-kill you!",
                    codename: killer.codename,
                    timestamp: Date.now()
                });

                return false;
            },
            [Delay.day * 3]: async (): Promise<boolean> => {
                const futureKiller: IUser = await this.api.endpoints.users.getByAlias(killer.alias);
                if (futureKiller.kills !== killer.kills) {
                    return true;
                }

                await this.finalizeDeath(futureKiller);

                await this.api.fireNotificationCallbacks({
                    cause: NotificationCause.KillReminder,
                    description: "You haven't killed in three days so we've auto-killed you. Better luck next time!",
                    codename: killer.codename,
                    timestamp: Date.now()
                });

                return false;
            }
        });
    }
}
