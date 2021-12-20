import React from 'react';
import {
  Bullseye
} from '@patternfly/react-core';
import {
  ControlCard,
  LogWindow
} from '@code-ready/crc-react-components';
import '@code-ready/crc-react-components/dist/index.css';

export default class StatusWindow extends React.Component {
  constructor(props) {
    super(props);

    this.onStart = this.onStart.bind(this);
    this.onStop = this.onStop.bind(this);
    this.onDelete = this.onDelete.bind(this);

    this.control = React.createRef();
    this.logWindow = React.createRef();
  }

  componentDidMount() {
    window.api.onStatusChanged(async (event, status) => {
      this.control.current.updateStatus(status);
    })
  }

  log(message) {
    this.logWindow.current.log(message);
  }

  onStart() {
    this.log("→ Start clicked");

    window.api.startInstance({})
  }

  onStop() {
    this.log("→ Stop clicked");

    window.api.stopInstance({})
  }

  onDelete() {
    this.log("→ Delete clicked");

    window.api.deleteInstance({})
  }

  render() {
    return (
      <>
        <Bullseye>
          <ControlCard ref={this.control}
            onStartClicked={this.onStart}
            onStopClicked={this.onStop}
            onDeleteClicked={this.onDelete} />
        </Bullseye>
        <Bullseye>
          <LogWindow cols={94} rows={12} ref={this.logWindow} />
        </Bullseye>
      </>
    );
  }
}
