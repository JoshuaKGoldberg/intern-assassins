/// <reference path="../../../../../typings/react/index.d.ts" />

"use strict";
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
 * State for a ClaimsTable component.
 */
interface IClaimsTableState { }

/**
 * Component for an editable user's field.
 */
export class ClaimsTable extends React.Component<IClaimsTableProps, IClaimsTableState> {
    /**
     * Renders the component.
     * 
     * @returns The rendered component.
     */
    public render(): JSX.Element {
        return (
            <table className="claims-table">
                <thead>
                    <tr>
                        <th>Killer</th>
                        <th>Victim</th>
                        <th>Time</th>
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
                <td>{claim.timestamp}</td>
                <td>(soon)</td>
            </tr>);
    }
}
