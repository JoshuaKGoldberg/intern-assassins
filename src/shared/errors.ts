"use strict";

/**
 * Possible causes for a ServerError.
 */
export enum ErrorCause {
    Unknown = 0,
    ClaimAlreadyExists,
    IncorrectCredentials,
    InvalidData,
    MissingField,
    MissingFields,
    NotAuthorized,
    NotImplemented,
    UserDoesNotExist,
    UsersDoNotExist,
    UserAlreadyExists,
    UsersAlreadyExist,
    UserDead,
    UsersDead,
    WrongTarget
}
