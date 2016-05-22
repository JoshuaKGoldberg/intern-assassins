/**
 * Possible causes for a ServerError.
 */
export enum ErrorCause {
    Unknown = 0,
    IncorrectCredentials,
    MissingField,
    NotImplemented,
    PermissionDenied,
    PlayerDoesNotExist,
    PlayersDoNotExist,
    PlayerAlreadyExists,
    PlayersAlreadyExist,
    PlayerIsDead
}

/**
 * An error in the server.
 */
export class ServerError extends Error {
    /**
     * The root cause of this error.
     */
    public /* readonly */ cause: ErrorCause;

    /**
     * Initializes a new instance of the ServerError class.
     * 
     * @param cause   The root cause of this error.
     * @param args   Any arguments to display with the cause.
     */
    constructor(cause: ErrorCause, ...args: any[]) {
        const message = ErrorCause[cause] + args.join(", ");
        super(message);
        this.cause = cause;
    }

    /**
     * Creates a function that will throw a ServerError.
     * 
     * @param cause   The root cause of this error.
     * @param args   Any arguments to display with the cause.
     * @returns A function that will throw a ServerError.
     */
    public static inPromise<T>(cause: ErrorCause, ...args: any[]): () => T {
        return (): T => {
            throw new ServerError(cause, ...args);
        };
    }
}
