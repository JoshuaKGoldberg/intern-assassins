/// <reference path="../../../../../typings/react/index.d.ts" />

import * as React from "react";

export interface IGreetingState {
    nickname: string;
}

const greetings: string[] = [
    "Hey, {0}!",
    "Heya, {0}!",
    "Hey there, {0}!",
    "Hi, {0}!",
    "Hi there, {0}!",
    "Howdy, {0}!",
    "Sup {0}?"
];

export const Greeting: React.StatelessComponent<IGreetingState> = (state: IGreetingState): JSX.Element => {
    return (
        <h1 className="greeting">
            {greetings[(Math.random() * greetings.length | 0)].replace("{0}", state.nickname)}
        </h1>);
};
