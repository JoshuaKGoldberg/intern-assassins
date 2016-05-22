/// <reference path="../../../../../typings/react/index.d.ts" />

import * as React from "react";

export interface IActionProps {
    // ...
}

export interface IActionState {
    // ...
}

export class Actions extends React.Component<IActionProps, IActionState> {
    public render(): JSX.Element {
        return (
            <div className="actions">
                <input type="button" className="action" value="Report a kill" />
                <input type="button" className="action" value="Are you dead?" />
            </div>);
    }
};
