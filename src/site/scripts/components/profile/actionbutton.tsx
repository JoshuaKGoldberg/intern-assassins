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
     * Confirmation text to display in the confirmation dialog.
     */
    confirmationText?: string;

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
     * Whether this has had its confirmation expanded.
     */
    expanded: boolean;
}

/**
 * A component for an actionable button.
 */
export class ActionButton extends React.Component<IActionButtonProps, IActionButtonState> {
    /**
     * Reference key for the main action input.
     */
    private static refInput: string = "refInput";

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

        className += ` action-${this.props.text.toLowerCase().replace(/\s+/g, "-")}`;

        return (
            <div className={className}>
                {this.state.expanded
                    ? this.renderConfirmation()
                    : this.renderButton(this.props.confirmationText === undefined)}
            </div>);
    }

    /**
     * Renders the main action button.
     * 
     * @param skipConfirmation   Whether the action can skip a confirmation dialog.
     * @returns The rendered action button.
     */
    private renderButton(skipConfirmation: boolean): JSX.Element {
        const onClick = skipConfirmation
            ? (): void => this.props.action()
            : (): void => this.showConfirmation();

        return (
            <input
                className="action-button"
                onClick={onClick}
                ref={ActionButton.refInput}
                type="button"
                value={this.props.text} />);
    }

    /**
     * Renders a confirmation dialog for performing the action.
     * 
     * @returns The rendered confirmation dialog.
     */
    private renderConfirmation(): JSX.Element {
        return (
            <ConfirmationDialog
                action={this.props.action}
                close={(): void => this.hideConfirmation()}
                confirmationText={this.props.confirmationText} />);
    }

    /**
     * Shows the confirmation dialog.
     */
    private showConfirmation(): void {
        this.setState({
            expanded: true
        });
    }

    /**
     * Hides the confirmation dialog.
     * 
     * @remarks This returns focus back to the main button.
     */
    private hideConfirmation(): void {
        this.setState(
            {
                expanded: false
            },
            (): void => {
                (this.refs[ActionButton.refInput] as HTMLInputElement).focus();
            });
    }
}
