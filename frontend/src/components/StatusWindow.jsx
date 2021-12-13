import React from 'react';
import {
  Bullseye
} from '@patternfly/react-core';
import {
  ControlCard
} from '@gbraad/crc-react-components';

export default class StatusWindow extends React.Component {
  constructor(props) {
    super(props);
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
        <ControlCard
          onStartClicked={this.onStart}
          onStopClicked={this.onStop}
          onDeleteClicked={this.onDelete} />
    </Bullseye>
    );
  }
}
