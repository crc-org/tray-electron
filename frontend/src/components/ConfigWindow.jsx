import React from 'react';
import {
    Bullseye
} from '@patternfly/react-core';
import {
    Settings
} from '@gbraad/crc-react-components';

export default class ConfigWindow extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Bullseye>
                <Settings />
            </Bullseye>
        );
    }
}
