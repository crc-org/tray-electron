import React from 'react';
import {
  Bullseye
} from '@patternfly/react-core';
import {
  ControlCard
} from '@code-ready/crc-react-components';
import '@code-ready/crc-react-components/dist/index.css';

export default class StatusWindow extends React.Component {
  constructor(props) {
    super(props);

    this.control = React.createRef();
  }

  componentDidMount() {
    window.api.onStatusChanged(async (event, status) => {
      this.control.current.updateStatus(status);
    })
  }

  onStart() {
    window.api.startInstance({})
  }

  onStop() {
    window.api.stopInstance({})
  }

  onDelete() {
    window.api.deleteInstance({})
  }

  render() {
    return (
    <Bullseye>
        <ControlCard ref={this.control}
          onStartClicked={this.onStart}
          onStopClicked={this.onStop}
          onDeleteClicked={this.onDelete} />
    </Bullseye>
    );
  }
}
