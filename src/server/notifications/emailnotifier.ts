/// <reference path="../../../typings/node/index.d.ts" />
/// <reference path="../../../typings/nodemailer/index.d.ts" />

"use strict";
import * as nodemailer from "nodemailer";
import * as smtp from "nodemailer-smtp-transport";
import { INotification, NotificationCause } from "../../shared/notifications";
import { IUser } from "../../shared/users";
import { Api } from "../api";
import { INotifier } from "./notifiers";

/**
 * Callbacks to send an email, keyed by notification cause.
 */
interface INotificationEmailers {
    [i: number]: (notification: INotification) => Promise<void>;
}

/**
 * Settings to set up an email notifier.
 */
export interface IEmailSettings {
    /**
     * Email addressess to CC on all outgoing emails.
     */
    cc: string[];

    /**
     * Domain for user emails after their alias.
     */
    domain: string;

    /**
     * Settings for the transporter.
     */
    transporter: smtp.SmtpOptions;

    /**
     * Friendly name of the hosting assassins website.
     */
    website: string;
}

/**
 * Broadcasts notifications as SMTP emails.
 */
export class EmailNotifier implements INotifier {
    /**
     * Email callbacks for types of notifications.
     */
    private notificationEmailers: INotificationEmailers = {
        [NotificationCause.Death]: this.emailDeathToVictim,
        [NotificationCause.Kill]: this.emailKillToKiller,
        [NotificationCause.KillClaimToKiller]: this.emailKillClaimToKiller,
        [NotificationCause.KillClaimToVictim]: this.emailKillClaimToVictim
    };

    /**
     * Request router to internal storage.
     */
    private api: Api;

    /**
     * Settings used to set up this email notifier.
     */
    private settings: IEmailSettings;

    /**
     * Sends emails.
     */
    private transporter: nodemailer.Transporter;

    /**
     * Initializes a new instance of the EmailNotifier class.
     * 
     * @param api   Request router to API endpoints.
     * @param settings   Settings to set up the email notifier.
     */
    public constructor(api: Api, settings?: IEmailSettings) {
        this.api = api;

        // Tests might not have email settings, so it's ok if it doesn't exist
        if (!settings) {
            this.settings = {
                cc: [],
                domain: "@localhost",
                transporter: {},
                website: "localhost"
            };
            return;
        }

        this.settings = settings;

        // If email settings do exist, they must be filled out to create a transporter
        if (!settings.transporter.service) {
            throw new Error("No transporter.service defined in email settings.");
        }
        if (!settings.transporter.auth) {
            throw new Error("No transporter.auth defined in email settings.");
        }

        this.transporter = nodemailer.createTransport(settings.transporter);
    }

    /**
     * Broadcasts a notification to a user's email.
     * 
     * @param notification   A new notification.
     * @returns A promise for the email being sent.
     */
    public async receive(notification: INotification): Promise<void> {
        if (!this.notificationEmailers[notification.cause]) {
            return Promise.resolve();
        }

        return this.notificationEmailers[notification.cause].call(this, notification);
    }

    /**
     * Sends an email to a victim regarding their death.
     * 
     * @param notification   The triggering notification.
     * @returns A promise for the email being sent.
     */
    private async emailDeathToVictim(notification: INotification): Promise<void> {
        const user: IUser = await this.api.endpoints.users.getByCodename(notification.codename);

        this.sendMail({
            subject: "You died!",
            text: `Better luck next time, ${user.codename}.`,
            to: user.alias
        });
    }

    /**
     * Sends an email to a killer regarding their kill.
     * 
     * @param notification   The triggering notification.
     * @returns A promise for the email being sent.
     */
    private async emailKillToKiller(notification: INotification): Promise<void> {
        const user: IUser = await this.api.endpoints.users.getByCodename(notification.codename);

        this.sendMail({
            subject: "You scored a kill!",
            text: `Well played, ${user.codename}! You now have ${user.kills} kill${user.kills === 0 ? "" : "s"}.`,
            to: user.alias
        });
    }

    /**
     * Sends an email to a claiming killer regarding their claim.
     * 
     * @param notification   The triggering notification.
     * @returns A promise for the email being sent.
     */
    private async emailKillClaimToKiller(notification: INotification): Promise<void> {
        const user: IUser = await this.api.endpoints.users.getByCodename(notification.codename);

        this.sendMail({
            subject: "You've claimed a kill.",
            text: `Your target hasn't yet verified it. Remind them in a few minutes if they don't.`,
            to: user.alias
        });
    }

    /**
     * Sends an email to a claimed victim regarding the claim against them.
     * 
     * @param notification   The triggering notification.
     * @returns A promise for the email being sent.
     */
    private async emailKillClaimToVictim(notification: INotification): Promise<void> {
        const user: IUser = await this.api.endpoints.users.getByCodename(notification.codename);

        this.sendMail({
            subject: "Your killer claims they've killed you.",
            text: `Head to ${this.settings.website} now to verify it.`,
            to: user.alias
        });
    }

    /**
     * Sends an email.
     * 
     * @param settings   Nodemailer settings for the email.
     */
    private sendMail(settings: nodemailer.SendMailOptions): void {
        if (!this.transporter) {
            return;
        }

        this.transporter.sendMail({
            cc: this.settings.cc,
            from: settings.from || this.settings.transporter.auth.user,
            subject: settings.subject,
            text: settings.text,
            to: `settings.to${this.settings.domain}`
        });
    }
}
