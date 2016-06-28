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
     * The action to execute on cancel.
     */
    onCancel: () => void;

    /**
     * The confirmation text to display.
     */
    confirmationText: string;
}

/**
 * A component for a confirmation dialog box.
 */
export const ConfirmationDialog: React.StatelessComponent<IConfirmationDialogProps> = (props: IConfirmationDialogProps): JSX.Element => {
        return (
             <div className="action-confirmation-container">
                 <div className="action-confirmation-text">{props.confirmationText}</div>
                 <div className="action-confirmation-buttons">
                     <input
                        onClick={props.onCancel}
                        type="button"
                        value="Cancel" />
                     <input
                         className="action-confirm"
                         onClick={props.action}
                         type="button"
                         value="Confirm" />
                 </div>
             </div>);
};
