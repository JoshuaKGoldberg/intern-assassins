/// <reference path="../../../typings/node/index.d.ts" />
/// <reference path="../../../typings/socket.io/index.d.ts" />

"use strict";
import * as http from "http";
import * as socketIo from "socket.io";
import { INotification } from "../../shared/notifications";
import { INotifier } from "./notifiers";

/**
 * Broadcasts notifications to a socket.io server.
 */
export class SocketNotifier implements INotifier {
    /**
     * Backing socket.io server.
     */
    private ioServer: SocketIO.Server;

    /**
     * Initializes a new instance of the SocketNotifier class.
     * 
     * @param httpServer   Backing http server.
     */
    public constructor(httpServer: http.Server) {
        this.ioServer = socketIo(httpServer);
    }

    /**
     * Broadcasts a notification to the socket.io server.
     * 
     * @param notification   A new notification.
     */
    public receive(notification: INotification): void {
        this.ioServer.emit("report", notification);
    }
}
