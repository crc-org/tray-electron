import React from 'react';
import {
    Bullseye, Button,
} from '@patternfly/react-core';
import { SetupSpinner } from '../components/SetupSpinner';


export default class SetupWindow extends React.Component {
    constructor(props: {}) {
      super(props);
      this.onCloseBtn = this.onCloseBtn.bind(this);
    }

    private onCloseBtn() {
      window.close();
    }

    render() {
      return (
        <>
            <Bullseye>
                <SetupSpinner consentTelemetry={false} preset={''} pullsecret={""} />
            </Bullseye>
        </>
      );
    }
}

