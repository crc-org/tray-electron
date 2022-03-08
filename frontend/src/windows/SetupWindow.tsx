import React from 'react';
import {
    Bullseye,
} from '@patternfly/react-core';
import { SetupSpinner } from '../components/SetupSpinner';

export default class SetupWindow extends React.Component {
    constructor(props: {}) {
      super(props);
    }

    render() {
      return (
        <>
            <Bullseye>
                <SetupSpinner />
            </Bullseye>
        </>
      );
    }
}

