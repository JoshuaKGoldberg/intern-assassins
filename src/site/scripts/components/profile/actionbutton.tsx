/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
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
    small?: boolean;

    /**
     * 
     */
    text: string;
}

/**
 * 
 */
export interface IActionButtonState {
    /**
     * 
     */
    delay?: number;

    /**
     * 
     */
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

        if (this.props.small) {
            className += " action-small";
        }

        if (this.state.expanded) {
            className += " action-expanded";
        }

        className += ` action-${this.props.text.replace(/\s+/g, "-")}`;

        return (
            <div className={className}>
                {this.renderActionButton()}
                {this.renderActionConfirmation()}
            </div>);
    }

    /**
     * 
     */
    private renderActionButton(): JSX.Element {
        return (
            <input
                className="action-button"
                onClick={(): void => this.toggleExpansion()}
                type="button"
                value={this.props.text} />);
    }

    /**
     * 
     */
    private renderActionConfirmation(): JSX.Element {
        let onClick: () => void;
        let value: string;

        if (!this.state.expanded || this.state.delay > 0) {
            onClick = undefined;
            value = this.state.delay ? this.state.delay.toString() : "";
        } else {
            onClick = (): void => {
                this.props.action();
                this.toggleExpansion();
            };
            value = "For real?";
        }

        return (
            <input
                className="action-confirmation"
                onClick={onClick}
                type="button"
                value={value} />);
    }

    /**
     * 
     */
    private toggleExpansion(): void {
        if (this.state.expanded) {
            this.setState({
                expanded: false
            });

            return;
        }

        this.setState({
            expanded: true,
            delay: 3
        });

        const interval: NodeJS.Timer = setInterval(
            (): void => {
                if (this.state.delay === 0) {
                    clearInterval(interval);
                } else {
                    this.setState({
                        expanded: true,
                        delay: this.state.delay - 1
                    });
                }
            },
            1000);
    }
}
