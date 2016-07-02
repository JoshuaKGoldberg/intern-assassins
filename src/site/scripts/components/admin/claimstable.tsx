/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
import * as Moment from "moment";
import * as React from "react";
import { IClaim } from "../../../../shared/kills";
import { IUser } from "../../../../shared/users";
import { Sdk } from "../../sdk/sdk";

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
                <td>(soon)</td>
            </tr>);
    }
}
