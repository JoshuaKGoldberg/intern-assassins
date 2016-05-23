/// <reference path="../../../../typings/react/index.d.ts" />
/// <reference path="../../../../typings/react-dom/index.d.ts" />

import * as React from "react";

/**
 * 
 */
export const Footer: React.StatelessComponent<void> = (): JSX.Element => {
    return (
        <footer>
            <h2>Microsoft ISC Assassins 2016</h2>
            <p>
                <em>Assassins</em> is a game in which each player secretly has a target they are trying to kill.
            </p>
        </footer>);
};
