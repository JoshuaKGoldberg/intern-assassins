/// <reference path="../../../typings/node/index.d.ts" />
/// <reference path="../../../typings/nodemailer/index.d.ts" />

"use strict";
import * as nodemailer from "nodemailer";
import * as smtp from "nodemailer-smtp-transport";
import { INotification } from "../../shared/notifications";
import { INotifier } from "./notifiers";

/**
 * Settings to set up an email notifier.
 */
export type IEmailSettings = smtp.SmtpOptions;

/**
 * Broadcasts notifications as SMTP emails.
 */
export class EmailNotifier implements INotifier {
    /**
     * Settings used to set up the transporter.
     */
    private settings: IEmailSettings;

    /**
     * Sends emails.
     */
    private transporter: nodemailer.Transporter;

    /**
     * Initializes a new instance of the EmailNotifier class.
     * 
     * @param settings   Settings to set up the email notifier.
     */
    public constructor(settings: IEmailSettings) {
        if (!settings.service) {
            throw new Error("No service defined in email settings.");
        }
        if (!settings.auth) {
            throw new Error("No auth defined in email settings.");
        }

        this.settings = settings;
        this.transporter = nodemailer.createTransport(settings);
    }

    /**
     * Broadcasts a notification to the socket.io server.
     * 
     * @param notification   A new notification.
     */
    public receive(notification: INotification): void {
        console.log("Got notification to email", notification);
    }
}
