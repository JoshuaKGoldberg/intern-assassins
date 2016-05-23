/// <reference path="../../typings/all.d.ts" />

import * as http from "http";
import * as socketIo from "socket.io";

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
}
