"use strict";

/**
 * Possible causes for a ServerError.
 */
export enum ErrorCause {
    Unknown = 0,
    ClaimAlreadyExists,
    IncorrectCredentials,
    MissingField,
    MissingFields,
    NotAuthorized,
    NotImplemented,
    PermissionDenied,
    UserDoesNotExist,
    UsersDoNotExist,
    UserAlreadyExists,
    UsersAlreadyExist,
    UserDead,
    UsersDead,
    WrongTarget
}

/**
 * An error triggered in the server.
 */
export class ServerError extends Error {
    /**
     * Little tidbits to help the user through difficult situations.
     */
    private static lifeAdviseSayings: string[] = [
        "'AAAYYYY LMAOOOOOOO' - Satya Nadella",
        "Beware of people who are rude to waiters.",
        "'DEVELOPERS DEVELOPERS DEVELOPERS' - Steve Ballmer",
        "Don't bite the hand that feeds you.",
        "Exercise. It's worth the time.",
        "'First you work for your reputation, then your reputation works for you.' - Mark Goldberg",
        "Frog blast the vent core!",
        "Have you tried turning it off and on again?",
        "If it takes less than a minute, just do it.",
        "If not now, when?",
        "If you work all the time, what are you working for?",
        "'If you can't explain it simply, you don't understand it well enough.' - Albert Einstein",
        "'If you liked it, then you shoulda put a ring on it.' - Beyoncé",
        "'It always seems impossible until it's done.' - Nelson Mandela",
        "'It is better to offer no excuse than a bad one.' - George Washington",
        "'Most of what you see online is false' - Abraham Lincoln",
        "Never gonna give you up...",
        "Never gonna let you down...",
        "Never gonna run around and desert you...",
        "'Plain question and plain answer make the shortest road out of most perplexities.' - Mark Twain",
        "Bad code makes bad products.",
        "Stacks never overflow; they just go missing in actions.",
        "The Garage is pretty awesome. This feature was coded there!",
        "The road to hell is paved with good intentions.",
        "'Trix are better than Cocoa Puffs.' - David Goldschmidt",
        "'You're an idiot.' - Gregory House",
        "'You're only given a little spark of madness. You mustn't lose it. - Robin Williams"
    ];

    /**
     * Extra information on the cause of this error.
     */
    public /* readonly */ information: any[];

    /**
     * A little tidbit to help the user through their difficult situation.
     */
    public /* readonly */ lifeAdvise: string;

    /**
     * Initializes a new instance of the ServerError class.
     * 
     * @param cause   The root cause of this error.
     * @param information   Any extra information to display with the cause.
     */
    constructor(cause: ErrorCause, information?: any) {
        super(ErrorCause[cause]);
        this.information = information;
        this.lifeAdvise = ServerError.lifeAdviseSayings[Math.random() * ServerError.lifeAdviseSayings.length | 0];
    }

    /**
     * Creates a function that will throw a ServerError.
     * 
     * @param cause   The root cause of this error.
     * @param information   Any extra information to display with the cause.
     * @returns A function that will throw a ServerError.
     */
    public static inPromise<T>(cause: ErrorCause, information: any): () => T {
        return (): T => {
            throw new ServerError(cause, information);
        };
    }
}
