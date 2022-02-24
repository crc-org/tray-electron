import React from 'react';

import {
    Progress, ProgressVariant, ProgressMeasureLocation
} from '@patternfly/react-core';

import "./Status.scss";
import { CrcState } from './types';

export class PodmanStatus extends React.Component {
    state: CrcState;

    constructor(props: {}) {
        super(props);
        this.state = {
            CrcStatus: "Unknown",
            PodmanVersion: "Unknown",
            DiskUse: 0,
            DiskSize: 1
        };

        this.updateState = this.updateState.bind(this);
    }

    updateStatus(values: CrcState) {
        const self = this; // make sure 'self' references to this
        Object.entries(values).forEach(function(value) {
            self.updateState(value[0], value[1]);
        });
    }

    formatSize(bytes: number): string {
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (!bytes && 'O B') ||
            (bytes / Math.pow(1024, i)).toFixed(1) + " " + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    }

    updateState(key: string, value: unknown): void {
        const newState = { ["" + key]: value };
        this.setState(newState);
    }

    render() {
        let fraction = this.state.DiskUse / this.state.DiskSize;

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
                        <th id="crc-status-podman" scope="row">Podman</th>
                        <td>
                            {this.state.PodmanVersion}
                        </td>
                    </tr>
                    <tr>
                        <th id="crc-status-disksize-progress" scope="row">Disk</th>
                        <td>
                            <Progress value={this.state.DiskUse}
                                className="pf-m-sm"
                                min={0} max={ this.state.DiskSize === 0 ? Number(1) : Number(this.state.DiskSize) }
                                variant={fraction > 0.9 ? ProgressVariant.danger : undefined}
                                aria-labelledby="crc-status-disksize-progress"
                                label={this.formatSize(this.state.DiskUse) + "/" + this.formatSize(this.state.DiskSize)}
                                measureLocation={ProgressMeasureLocation.outside} />
                        </td>
                    </tr>
                    <tr>
                        <th id="crc-status-emptyline" scope="row">&nbsp;</th>
                        <td>
                            &nbsp;
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}
