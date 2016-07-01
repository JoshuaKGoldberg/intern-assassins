/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as React from "react";

/**
 * Props for a ConfirmationDialog component.
 */
export interface IConfirmationDialogProps {
    /**
     * The action to execute on confirm.
     */
    action: () => void;

    /**
     * The confirmation text to display.
     */
    confirmationText: string;

    /**
     * Closes the confirmation dialog.
     */
    close: () => void;
}

/**
 * A component for a confirmation dialog box.
 */
export const ConfirmationDialog: React.StatelessComponent<IConfirmationDialogProps> = (props: IConfirmationDialogProps): JSX.Element => {
    return (
        <section className="confirmation-dialog">
            <div className="confirmation-dialog-display">
                <p>{props.confirmationText}</p>
                <div>
                    <input
                        onClick={props.close}
                        type="button"
                        value="Cancel" />
                    <input
                        className="action-confirm"
                        onClick={(): void => {
                            props.action();
                            props.close();
                        }}
                        type="button"
                        value="Confirm" />
                </div>
            </div>
        </section>);
};
