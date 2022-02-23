import React from 'react';
import {
  Bullseye
} from '@patternfly/react-core';
import {
  LogWindow
} from '../components/LogWindow';

export default class LogsWindow extends React.Component {
  private logWindow: React.RefObject<LogWindow>;

  constructor(props: {}) {
    super(props);
    this.logWindow = React.createRef();
  }

  componentDidMount() {
    window.api.onLogsRetrieved(async (event, logs) => {
      logs.forEach(l => this.logWindow.current?.log(l));
    });

    // This is NOT ideal
    window.api.retrieveLogs();
  }

  render() {
    return (
      // would like:
      //   backgroundColor : "black"
      // but that means the textarea border needs to be removed
      <Bullseye style={{ backgroundColor : "black"}}>
        <LogWindow ref={this.logWindow}
          cols={0} rows={0}
        />
      </Bullseye>
    );
  }
}
