import React from 'react';

import "./Status.scss";
import { CrcState } from './types';

interface UnknownStatusState {
    readonly CrcStatus: string;
}

export class UnknownStatus extends React.Component {
    state: UnknownStatusState;

    constructor(props: {}) {
        super(props);
        this.state = {
            CrcStatus: "Unknown",
        };

        this.updateState = this.updateState.bind(this);
    }

    updateStatus(values: CrcState) {
        console.log("Unknown preset");
        const self = this; // make sure 'self' references to this
        Object.entries(values).forEach(function(value) {
            self.updateState(value[0], value[1]);
        });
    }

    updateState(key:string, value: unknown) {
        const newState = { ["" + key]: value };
        this.setState(newState);
    }

    render() {
        return (
            <table className="pf-c-table pf-m-grid-md pf-m-compact">
                <tbody>
                    <tr>
                        <th style={{width:"100px"}} id="crc-status-crc" scope="row">Status</th>
                        <td width="200px">
                            {this.state.CrcStatus}
                        </td>
                    </tr>
                    <tr>
                        <th>&nbsp;</th>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <th>&nbsp;</th>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <th>&nbsp;</th>
                        <td>&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}
