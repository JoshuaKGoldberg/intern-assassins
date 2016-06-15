/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";

/**
 * Props for an ActionButton component.
 */
export interface IActionButtonProps {
    /**
     * Action to take when activated.
     */
    action: () => void;

    /**
     * Whether the button is small.
     */
    small?: boolean;

    /**
     * Textual display.
     */
    text: string;
}

/**
 * State for an ActionButton component.
 */
interface IActionButtonState {
    /**
     * How long until this can be activated.
     */
    delay?: number;

    /**
     * Whether this has had its confirmation expanded.
     */
    expanded: boolean;

    /**
     * Confirmation text, chosen at random.
     */
    confirmation: string;
}

/**
 * A component for an actionable button.
 */
export class ActionButton extends React.Component<IActionButtonProps, IActionButtonState> {
    /**
     * Possible confirmation texts.
     */
    private static /* readonly */ confirmations: string[] = [
        "Are you sure",
        "For real?",
        "O rly?",
        "You sure?"
    ];

    /**
     * State for the component.
     */
    public state: IActionButtonState = {
        confirmation: ActionButton.confirmations[Math.random() * ActionButton.confirmations.length | 0],
        expanded: false
    };

    /**
     * Renders the component.
     * 
     * @returns The rendered component.
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
                {this.renderButton()}
                {this.renderConfirmation()}
            </div>);
    }

    /**
     * Renders the input button.
     * 
     * @returns The rendered input button.
     */
    private renderButton(): JSX.Element {
        return (
            <input
                className="action-button"
                onClick={(): void => this.toggleExpansion()}
                type="button"
                value={this.props.text} />);
    }

    /**
     * Renders the confirmation button.
     * 
     * @returns The rendered confirmation button.
     */
    private renderConfirmation(): JSX.Element {
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
            value = this.state.confirmation;
        }

        return (
            <div className="action-confirmation">
            <input
                onClick={onClick}
                type="button"
                value={value} />
                {this.renderCancel()}
            </div>);
    }

    private renderCancel(): JSX.Element {
        let onClick: () => void;

        if (this.state.expanded) {
            onClick = (): void => {
                this.toggleExpansion();
            };
        }

        return (
          <input
            onClick={onClick}
            type="button"
            value="Cancel"/>);
    }

    /**
     * Toggles whether this is expanded for a confirmation button.
     */
    private toggleExpansion(): void {
        if (this.state.expanded) {
            this.setState({
                confirmation: this.state.confirmation,
                expanded: false,
                delay: 0
            });

            return;
        }

        this.setState({
            confirmation: this.state.confirmation,
            expanded: true,
            delay: 3
        });

        const interval: NodeJS.Timer = setInterval(
            (): void => {
                if (this.state.delay === 0) {
                    clearInterval(interval);
                } else {
                    this.setState({
                        confirmation: this.state.confirmation,
                        expanded: true,
                        delay: this.state.delay - 1
                    });
                }
            },
            1000);
    }
}
