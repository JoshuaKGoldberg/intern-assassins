/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";
import { ConfirmationDialog } from "./confirmationdialog";

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

    /**
     * Confirmation text to display in the confirmation dialog.
     */
    confirmationText?: string;
}

/**
 * State for an ActionButton component.
 */
interface IActionButtonState {

    /**
     * Whether this has had its confirmation expanded.
     */
    expanded: boolean;
}

/**
 * A component for an actionable button.
 */
export class ActionButton extends React.Component<IActionButtonProps, IActionButtonState> {
    /**
     * State for the component.
     */
    public state: IActionButtonState = {
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

        if (this.props.confirmationText === undefined) {
            return (
            <div className={className}>
                {this.renderButton(true)}
            </div>);
        } else {
        return (
            <div className={className}>
                {this.renderButton(false)}
                {this.renderConfirmation()}
            </div>);
        }
    }

    /**
     * Renders the input button.
     * 
     * @returns The rendered input button.
     */
    private renderButton(shortCircuitAction: boolean): JSX.Element {
        if (shortCircuitAction) {
            let onClick = (): void => {
                this.props.action();
            };

            return (
                <input
                    className="action-button"
                    onClick={(onClick)}
                    type="button"
                    value={this.props.text} />);
        } else {
            return (
                <input
                    className="action-button"
                    onClick={() => this.toggleExpansion()}
                    type="button"
                    value={this.props.text} />);
        }

    }

    /**
     * Renders the confirmation button.
     * 
     * @returns The rendered confirmation button.
     */
    private renderConfirmation(): JSX.Element {
        let onClick: () => void;

        if (!this.state.expanded) {
            onClick = undefined;
        } else {
            onClick = (): void => {
                this.props.action();
                this.toggleExpansion();
            };
        }

        return (
            <div className="action-confirmation">
                <div className="action-confirmation-overlay"/>
                <ConfirmationDialog
                    action={() => onClick()}
                    onCancel={() => this.toggleExpansion()}
                    confirmationText={this.props.confirmationText} />
            </div>);
    }

    /**
     * Toggles whether this is expanded for a confirmation button.
     */
    private toggleExpansion(): void {
        if (this.state.expanded) {
            this.setState({
                expanded: false,
            });

            return;
        }

        this.setState({
            expanded: true
        });
    }
}
