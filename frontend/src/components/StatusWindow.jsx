import React from 'react';
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
        <ControlCard
          onStartClicked={this.onStart}
          onStopClicked={this.onStop}
          onDeleteClicked={this.onDelete} />
    );
  }
}
