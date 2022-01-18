import React from 'react';
import {
    Bullseye
} from '@patternfly/react-core';
import {
    Configuration
} from '@code-ready/crc-react-components';
import '@code-ready/crc-react-components/dist/index.css';

export default class ConfigurationWindow extends React.Component {
    constructor(props) {
        super(props);

        this.configurationValueChanged = this.configurationValueChanged.bind(this);
        this.configurationSave = this.configurationSave.bind(this);
        this.configurationReset = this.configurationReset.bind(this);
        this.openPullsecretChangeWindow = this.openPullsecretChangeWindow.bind(this);

        this.config = React.createRef();
    }

    componentDidMount() {
        window.api.onConfigurationLoaded(async (event, data) => {
            this.config.current.updateValues(data.Configs);
        })
        window.api.onConfigurationSaved(async (event, message) => {

        })

        window.api.configurationLoad({})
    }

    configurationValueChanged(caller, key, value) {
        // perform validation ?
        caller.updateValue(key, value);
    }

    configurationSave(data) {
        window.api.configurationSave(data)
    }

    configurationReset() {
        this.configurationLoad();
    }

    configurationLoad() {
        window.api.configurationLoad({})
    }

    openPullsecretChangeWindow() {
        window.api.openOpullsecretChangeWindow({})
    }

    render() {
        return (
            <Bullseye>
                <Configuration ref={this.config}
                        onValueChanged={this.configurationValueChanged}
                        onSaveClicked={this.configurationSave}
                        onResetClicked={this.configurationReset}
                        onPullsecretChangeClicked={this.openPullsecretChangeWindow} />
            </Bullseye>
        );
    }
}
