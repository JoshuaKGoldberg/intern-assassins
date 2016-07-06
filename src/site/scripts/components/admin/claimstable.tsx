/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as Moment from "moment";
import * as React from "react";
import { ClaimAction, IClaim } from "../../../../shared/kills";
import { IUser } from "../../../../shared/users";
import { Sdk } from "../../sdk/sdk";
import { ActionButton } from "../profile/actionbutton";

/**
 * Props for an ClaimsTable component.
 */
export interface IClaimsTableProps {
    /**
     * Information on the current admin.
     */
    admin: IUser;

    /**
     * Any active kill claims related to the user, if not anonymous.
     */
    claims?: IClaim[];

    /**
     * Wrapper around the server API.
     */
    sdk: Sdk;
}

/**
 * Component for an editable user's field.
 */
export class ClaimsTable extends React.Component<IClaimsTableProps, void> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <div className="claims-table">
                <h3>Claims</h3>
                {this.renderClaims()}
            </div>);
    }

    /**
     * Renders claims, if there are any.
     * 
     * @returns The rendered claims.
     */
    public renderClaims(): JSX.Element {
        if (!this.props.claims.length) {
            return <em>Nothing right now...</em>;
        }

        return (
            <table>
                <thead>
                    <tr>
                        <th>Killer</th>
                        <th>Victim</th>
                        <th className="claim-time">Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.claims.map((claim: IClaim): JSX.Element => {
                        return this.renderClaim(claim);
                    })}
                </tbody>
            </table>);
    }

    /**
     * Renders a single claim row.
     * 
     * @param claim   A claim to render.
     * @returns The rendered claim.
     */
    private renderClaim(claim: IClaim): JSX.Element {
        return (
            <tr>
                <td>{claim.killer}</td>
                <td>{claim.victim}</td>
                <td className="claim-time">{Moment(claim.timestamp).calendar()}</td>
                <td>
                    <ActionButton
                        action={(): void => { this.actOnClaim(claim, ClaimAction.Approve); }}
                        confirmationText={`Are you sure you want to approve the claim by ${claim.killer}?`}
                        text="Approve" />
                    <ActionButton
                        action={(): void => { this.actOnClaim(claim, ClaimAction.Deny); }}
                        confirmationText={`Are you sure you want to deny the claim by ${claim.killer}?`}
                        text="Deny" />
                </td>
            </tr>);
    }

    /**
     * POSTs an action on a claim.
     * 
     * @param claim   A claim to act upon.
     * @param action   The action to take on the claim.
     * @returns A promise for completing the action.
     */
    private async actOnClaim(claim: IClaim, action: ClaimAction): Promise<void> {
        await this.props.sdk.actOnClaim(this.props.admin, claim, action);

        // Todo: be less inelegant
        location.reload();
    }
}
