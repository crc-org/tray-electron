import React from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardTitle, CardBody, CardFooter,
} from '@patternfly/react-core';
import {Actions, ActionsProps} from './Actions'
import {Status} from './Status'

import "./ControlCard.scss";
import { CrcState } from './types';

export interface ControlCardProps extends ActionsProps {
    readonly preset: string;
}

interface State {
    readonly CrcStatus: string;
}

export class ControlCard extends React.Component<ControlCardProps> {
    static propTypes = {
        preset: PropTypes.string,
        status: PropTypes.string,
        onPlayPauseClicked: PropTypes.func,
        onDeleteClicked: PropTypes.func
    };

    state: State;

    private status: React.RefObject<Status>;

    constructor(props: ControlCardProps) {
        super(props);
        this.state = {
            CrcStatus: this.props.status
        };

        this.updateStatus = this.updateStatus.bind(this);
        this.status = React.createRef();
    }

    updateStatus(values: CrcState) {
        this.status.current!.updateStatus(values);
    }

    componentWillReceiveProps(nextProps: ControlCardProps): void {
        this.setState({
            CrcStatus: nextProps.status
        })
    }
    
    render() {
        return (
            <Card className="crc-controlcard">
                <CardTitle>CodeReady Containers</CardTitle>
                <CardBody>
                    <Status ref={this.status}
                        preset={this.props.preset}/>
                </CardBody>
                <CardFooter>
                    <Actions
                        status={this.state.CrcStatus}
                        onPlayPauseClicked={this.props.onPlayPauseClicked}
                        onDeleteClicked={this.props.onDeleteClicked} />
                </CardFooter>
            </Card>
        );
    }
}

