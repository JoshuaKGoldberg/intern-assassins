/// <reference path="../../typings/all.d.ts" />

"use strict";
import * as http from "http";
import * as socketIo from "socket.io";
import { IReport } from "../shared/actions";
import { IKillClaim } from "../shared/kills";

/**
 * 
 */
export class Sockets {
    /**
     * 
     */
    private ioServer: SocketIO.Server;

    /**
     * Initializes a new instance of the Sockets class.
     */
    public constructor(server: http.Server) {
        this.ioServer = socketIo(server);
    }

    /**
     * 
     */
    public broadcast(report: IReport<IKillClaim>): void {
        this.ioServer.emit("report", `${report.data.killer} killed ${report.data.victim}!`);
    }
}
