import React from 'react';
import {
    Bullseye
} from '@patternfly/react-core';
import {
    Settings
} from '@code-ready/crc-react-components';
import '@code-ready/crc-react-components/dist/index.css';

export default class ConfigWindow extends React.Component {
    constructor(props) {
        super(props);

        this.settingsValueChanged = this.settingsValueChanged.bind(this);
        this.settingsSave = this.settingsSave.bind(this);
        this.settingsReset = this.settingsReset.bind(this);

        this.settings = React.createRef();
    }

    componentDidMount() {
        window.api.onConfigurationLoaded(async (event, data) => {
            this.settings.current.updateValues(data.Configs);
        })
        window.api.onConfigurationSaved(async (event, message) => {

        })

        window.api.configurationLoad({})
    }

    settingsValueChanged(caller, key, value) {
        // perform validation
        caller.updateValue(key, value);
    }

    settingsSave(data) {
        window.api.configurationSave(data)
    }

    settingsReset() {
        this.settingsLoad();
    }

    settingsLoad() {
        window.api.configurationLoad({})
    }

    render() {
        return (
            <Bullseye>
                <Settings ref={this.settings}
                        onValueChanged={this.settingsValueChanged}
                        onSaveClicked={this.settingsSave}
                        onResetClicked={this.settingsReset} />
            </Bullseye>
        );
    }
}
