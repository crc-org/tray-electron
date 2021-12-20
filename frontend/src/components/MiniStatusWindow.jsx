import React from 'react';

import {
  ControlCard
} from '@code-ready/crc-react-components';
import '@code-ready/crc-react-components/dist/index.css';

export default class MiniStatusWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preset: "unknown",
    };

    this.control = React.createRef();
  }

  componentDidMount() {
    window.api.onStatusChanged(async (event, status) => {
      if(status.preset !== undefined) {
        this.setState({"preset": status.preset})
      }

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
        <ControlCard ref={this.control}
          preset={this.state.preset}
          onStartClicked={this.onStart}
          onStopClicked={this.onStop}
          onDeleteClicked={this.onDelete} />
    );
  }
}
