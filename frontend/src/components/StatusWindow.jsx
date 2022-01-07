import React from 'react';
import {
  Bullseye
} from '@patternfly/react-core';
import {
  LogWindow
} from '@code-ready/crc-react-components';
import '@code-ready/crc-react-components/dist/index.css';

export default class StatusWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lastLineRead: 0
    };

    this.logWindow = React.createRef();
  }

  componentDidMount() {
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

  render() {
    return (
      // would like:
      //   backgroundColor : "black"
      // but that means the textarea border needs to be removed
      <Bullseye style={{ "padding-top": "5px", backgroundColor : "black"}}>
        <LogWindow ref={this.logWindow}
          cols={0} rows={0}
          width={"98vw"} height={"98vh"}
        />
      </Bullseye>
    );
  }
}
