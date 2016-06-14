/// <reference path="../../typings/all.d.ts" />

"use strict";
import * as http from "http";
import * as socketIo from "socket.io";
import { INotification } from "../shared/notifications";

/**
 * Emits real-time socket events for new and updated reports.
 */
export class Sockets {
    /**
     * Backing socket.io server.
     */
    private ioServer: SocketIO.Server;

    /**
     * Initializes a new instance of the Sockets class.
     * 
     * @param server   Backing http server.
     */
    public constructor(server: http.Server) {
        this.ioServer = socketIo(server);
    }

    /**
     * Emits a message.
     */
    public emitNotification(notification: INotification): void {
        this.ioServer.emit("report", notification);
    }
}
