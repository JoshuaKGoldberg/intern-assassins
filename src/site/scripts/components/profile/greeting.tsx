/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";

/**
 * Props for a Greeting component.
 */
export interface IGreetingProps {
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
 * One of the allowed greetings, chosen at random.
 */
const greeting = greetings[(Math.random() * greetings.length | 0)];

/**
 * Component for a happy greeting.
 */
export const Greeting: React.StatelessComponent<IGreetingProps> = (state: IGreetingProps): JSX.Element => {
    return (
        <h1 className="greeting">
            {greeting.replace("{0}", state.nickname)}
        </h1>);
};
