import React from 'react';
import {
    Bullseye
} from '@patternfly/react-core';
import {
    Settings
} from '@code-ready/crc-react-components';
import '@code-ready/crc-react-components/dist/index.css';

export default class ConfigWindow extends React.Component {
    // constructor(props) {
    //     super(props);
    // }

    render() {
        return (
            <Bullseye>
                <Settings />
            </Bullseye>
        );
    }
}
