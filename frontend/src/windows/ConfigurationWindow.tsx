import React from 'react';
import {
    Configuration, State
} from '../components/Configuration';

export default class ConfigurationWindow extends React.Component {

    private config: React.RefObject<Configuration>;

    constructor(props: {}) {
        super(props);

        this.configurationSave = this.configurationSave.bind(this);
        this.configurationReset = this.configurationReset.bind(this);
        this.openPullsecretChangeWindow = this.openPullsecretChangeWindow.bind(this);

        this.config = React.createRef();
    }

    componentDidMount() {
        window.api.onConfigurationLoaded(async (event, data) => {
            this.config.current!.updateValues(data.Configs);
        });
        window.api.onConfigurationSaved(async (event, message) => {

        });

        window.api.configurationLoad({});
    }

    configurationSave(data: State) {
        window.api.configurationSave(data)

        window.close();
    }

    configurationReset() {
        this.configurationLoad();
    }

    configurationLoad() {
        window.api.configurationLoad({})
    }

    openPullsecretChangeWindow() {
        window.api.openPullsecretChangeWindow({})
    }

    render() {
        return (
            <Configuration ref={this.config}
                onSaveClicked={this.configurationSave}
                onResetClicked={this.configurationReset}
                onPullsecretChangeClicked={this.openPullsecretChangeWindow}
                onPresetChange={e => {}}
                height="320px" />
        );
    }
}
