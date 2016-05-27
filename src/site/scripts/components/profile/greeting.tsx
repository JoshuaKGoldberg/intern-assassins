/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";

/**
 * Props for a Greeting component.
 */
export interface IGreetingProps {
    /**
     * Whether the user being greeted is an admin.
     */
    admin: boolean;

    /**
     * Nickname of the user being greeted.
     */
    nickname: string;
}

/**
 * Possible greetings, where "{0}" is replaced with a nickname.
 */
const greetings: string[] = [
    "Hey, {0}!",
    "Heya, {0}!",
    "Hey there, {0}!",
    "Hi, {0}!",
    "Hi there, {0}!",
    "Howdy, {0}!",
    "Sup {0}?"
];

/**
 * Possible declarations, where "{0}" is replaced with a nickname.
 */
const decorations: string[] = [
    "{0} the Bountiful",
    "{0} the Great",
    "{0} the Prosperous",
    "{0}, Breaker of Chains",
    "{0}, Protector of the Realm",
    "Supreme Dictator {0}",
    "Supreme Overlord {0}"
];

/**
 * One of the allowed greetings, chosen at random.
 */
const greeting = greetings[(Math.random() * greetings.length | 0)];

/**
 * One of the allowed decorations, chosen at random.
 */
const decoration = decorations[Math.random() * decorations.length | 0];

/**
 * Component for a happy greeting.
 */
export const Greeting: React.StatelessComponent<IGreetingProps> = (state: IGreetingProps): JSX.Element => {
    const nickname: string = state.admin
        ? decoration.replace("{0}", state.nickname)
        : state.nickname;

    const displayedGreeting: string = greeting.replace("{0}", nickname);

    return <h1 className="greeting">{displayedGreeting}</h1>;
};
