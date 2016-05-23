/// <reference path="../../../../../typings/react/index.d.ts" />

import * as React from "react";

/**
 * 
 */
export interface IActionButtonProps {
    /**
     * 
     */
    action: () => void;

    /**
     * 
     */
    text: string;
}

/**
 * 
 */
export interface IActionButtonState {
    expanded: boolean;
}

/**
 * 
 */
export class ActionButton extends React.Component<IActionButtonProps, IActionButtonState> {
    /**
     * 
     */
    public state: IActionButtonState = {
        expanded: false
    };

    /**
     * 
     */
    public render(): JSX.Element {
        let className: string = "action";

        if (this.state.expanded) {
            className += " action-expanded";
        }

        return (
            <div className={className}>
                <input
                    className="action-button"
                    onClick={(): void => this.toggleExpansion()}
                    type="button"
                    value={this.props.text} />
                <input
                    className="action-confirmation"
                    onClick={(): void => this.props.action()}
                    type="button"
                    value="For real?" />
            </div>);
    }

    /**
     * 
     */
    private toggleExpansion(): void {
        this.setState({
            expanded: !this.state.expanded
        });
    }
}
