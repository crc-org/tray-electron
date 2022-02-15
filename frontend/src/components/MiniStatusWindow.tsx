import React from 'react';

import {
  ControlCard
} from '@code-ready/crc-react-components';
import '@code-ready/crc-react-components/dist/index.css';

interface State {
  preset: string;
  vmstatus: string;
}
export default class MiniStatusWindow extends React.Component {
  state: Readonly<State>;

  private control: React.RefObject<ControlCard>;

  constructor(props: {}) {
    super(props);
    this.state = {
      preset: "unknown",
      vmstatus: "unknown"
    };

    this.control = React.createRef();
    this.onPlayPause = this.onPlayPause.bind(this);
  }

  componentDidMount() {
    window.api.onStatusChanged(async (event, status) => {
      this.setState({preset: status.Preset})

      // Toggle states of the button
      if(status.CrcStatus === "Stopping") {
        this.setState({vmstatus: "Starting"})
      } else {
        this.setState({vmstatus: status.CrcStatus})
      }

      this.control.current!.updateStatus(status);
    })
  }

  onPlayPause() {
    if(this.state.vmstatus === "Stopped") {
      window.api.startInstance({})
    }
    if(this.state.vmstatus === "Running") {
      window.api.stopInstance({})
    }
  }

  async onDelete(): Promise<void> {
    const result = await window.api.showModalDialog('Warning','Are you sure you want to delete the CodeReady Containers instance? This is a destructive operation and can not be undone.', 'Yes', 'No');
    if(result === 'Yes') {
      window.api.deleteInstance({})
    }
  }

  render() {
    return (
        <ControlCard ref={this.control}
          preset={this.state.preset}
          status={this.state.vmstatus}
          onPlayPauseClicked={this.onPlayPause}
          onDeleteClicked={this.onDelete} />
    );
  }
}
