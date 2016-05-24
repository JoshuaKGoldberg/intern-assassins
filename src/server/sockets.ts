/// <reference path="../../typings/all.d.ts" />

"use strict";
import * as http from "http";
import * as socketIo from "socket.io";
import { IReport } from "../shared/actions";
import { IKillClaim } from "../shared/kills";

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
     * Emits an event for a kill claim report.
     */
    public emit(report: IReport<IKillClaim>): void {
        const message: string = report.data.killer === report.data.victim
            ? `${report.data.victim} appears to be dead...`
            : `${report.data.killer} killed ${report.data.victim}!`;

        this.ioServer.emit("report", message);
    }
}
