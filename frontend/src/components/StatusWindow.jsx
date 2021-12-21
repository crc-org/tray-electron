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
    this.state = {
      preset: "unknown",
      lastLineRead: 0
    };

    this.onStart = this.onStart.bind(this);
    this.onStop = this.onStop.bind(this);
    this.onDelete = this.onDelete.bind(this);

    this.control = React.createRef();
    this.logWindow = React.createRef();
  }

  componentDidMount() {
    window.api.onStatusChanged(async (event, status) => {
      this.setState({preset: status.Preset})
      this.control.current.updateStatus(status);
    })

    window.api.onLogsRetrieved(async (event, logs) => {
      // TODO: onNewLogsRetrieved

      if(logs.Messages.length > this.state.lastLineRead) {
        var lineIndex = 0;
        for(lineIndex = this.state.lastLineRead; lineIndex < logs.Messages.length; lineIndex++) {
          var log = logs.Messages[lineIndex];
          this.logWindow.current.log(log);
        }
        this.setState({lastLineRead: lineIndex});
      }
    })

    // This is NOT ideal
    window.api.retrieveLogs();
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
      <>
        <Bullseye>
          <ControlCard ref={this.control}
            preset={this.state.preset}
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
