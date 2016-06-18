/// <reference path="../../../../typings/socket.io/index.d.ts" />

"use strict";
declare var io: SocketIOStatic;

/**
 * Retrieves the applicable route from a notification.
 * 
 * @param notification   A new notification.
 * @returns Which route to take for the notification, if any.
 * @type TNotification   The type of notification.
 */
interface IRouter<TNotification> {
    (notification: TNotification): number;
}

/**
 * Listing of notification handlers, keyed by route.
 */
interface IHandlers<TNotification, TState> {
    [i: number]: IHandler<TNotification, TState>;
}

/**
 * Generates a new state from a notification.
 * 
 * @param notification   The triggering notification.
 * @returns A new state.
 */
interface IHandler<TNotification, TState> {
    (notification: TNotification): TState;
}

/**
 * Receives a new state and its triggering notification.
 * 
 * @param state   A new state.
 * @param notification   The triggering notification.
 */
interface IReceiver<TNotification, TState> {
    (state: TState, notification: TNotification): void;
}

/**
 * Routes socket.io notifications to state-based receivers.
 * 
 * @type TNotification   The type of notifications.
 * @type TState   The type of states generated from the notifications.
 */
export class SocketHandler<TNotification, TState> {
    /**
     * Real-time socket.io server.
     */
    private socket: SocketIO.Server;

    /**
     * Generates handler routes from notifications.
     */
    private router: IRouter<TNotification>;

    /**
     * Receiver for generated states and their triggering notifications.
     */
    private receiver: IReceiver<TNotification, TState>;

    /**
     * State generators for notification routes.
     */
    private handlers: IHandlers<TNotification, TState> = {};

    /**
     * Initializes a new instance of the SocketHandler class.
     */
    public constructor() {
        this.socket = io();
        this.socket.on("report", (notification: TNotification): void => {
            this.handleNotification(notification);
        });
    }

    /**
     * Sets the notification router.
     * 
     * @param route   A new notification router.
     * @returns this
     */
    public setRouter(router: IRouter<TNotification>): this {
        this.router = router;
        return this;
    }

    /**
     * Sets the state receiver.
     * 
     * @param receiver   A new state receiver.
     * @returns this
     */
    public setReceiver(receiver: IReceiver<TNotification, TState>): this {
        this.receiver = receiver;
        return this;
    }

    /**
     * Adds a new routed notification handler.
     * 
     * @param route   A route for the notification handler.
     * @param handler   A new routed notification handler.
     * @returns this
     */
    public registerHandler(route: number, handler: IHandler<TNotification, TState>): this {
        this.handlers[route] = handler;
        return this;
    }

    /**
     * Handles a new notification.
     * 
     * @param notification   A new notification.
     */
    private handleNotification(notification: TNotification): void {
        const handler: IHandler<TNotification, TState> = this.getHandlerForNotification(notification);
        const newState: TState = handler(notification);

        this.receiver(newState, notification);
    }

    /**
     * Gets the correct handler for a notification.
     * 
     * @param notification   A new notification.
     * @returns The handler for the notification.
     */
    private getHandlerForNotification(notification: TNotification): IHandler<TNotification, TState> {
        if (!this.router) {
            throw new Error("No router defined.");
        }

        const route: number = this.router(notification);
        if (!this.handlers[route]) {
            throw new Error(`No handler for route '${route}'.`);
        }

        return this.handlers[route];
    }
}
