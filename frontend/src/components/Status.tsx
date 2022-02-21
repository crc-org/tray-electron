import React from 'react';
import PropTypes from 'prop-types';
import {PodmanStatus} from './PodmanStatus';
import {OpenShiftStatus} from './OpenShiftStatus';
import {UnknownStatus} from './UnknownStatus';

import "./Status.scss";
import { CrcState } from './types';

export interface StatusProps {
    readonly preset: string;
}

export interface UpdateStatusRef extends React.Component {
    updateStatus: (value: CrcState) => void;
}

export class Status extends React.Component<StatusProps> {
    static propTypes = {
        preset: PropTypes.string
    };

    private status: React.RefObject<PodmanStatus & OpenShiftStatus & UnknownStatus>;

    constructor(props: StatusProps) {
        super(props);

        this.status = React.createRef();
    }

    updateStatus(values: CrcState) {
        const status = this.status.current;
        if(status){
            status.updateStatus(values);
        }
    }

    render() {
        if (this.props.preset === "podman") {
            return <PodmanStatus ref={this.status} />
        } else
            if (this.props.preset === "openshift") {
                return <OpenShiftStatus ref={this.status} />
            }

        return (
            <UnknownStatus ref={this.status} />
        );
    }
}
