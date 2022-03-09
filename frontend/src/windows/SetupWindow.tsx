import React from 'react';
import {
    Bullseye,
} from '@patternfly/react-core';
import { SetupSpinner } from '../components/SetupSpinner';


export default class SetupWindow extends React.Component {
    constructor(props: {}) {
      super(props);
      this.onCloseBtn = this.onCloseBtn.bind(this);
    }

    private async onCloseBtn() {
      window.close();
    }

    render() {
      return (
        <>
            <Bullseye>
                <SetupSpinner
                    consentTelemetry={""}
                    preset={""}
                    pullsecret={""}
                    skipDaemonStart={true}
                    onFinishClicked={this.onCloseBtn}
                />
            </Bullseye>
        </>
      );
    }
}

