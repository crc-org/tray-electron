import React from 'react';
import {
    Configuration, State
} from '../components/Configuration';


export interface ConfigurationWindowState {
    readonly presetChanged: boolean;
}

export default class ConfigurationWindow extends React.Component {

    private config: React.RefObject<Configuration>;
    state: ConfigurationWindowState;

    constructor(props: {}) {
        super(props);
        this.state = {
            presetChanged: false
        }

        this.configurationSave = this.configurationSave.bind(this);
        this.configurationReset = this.configurationReset.bind(this);
        this.openPullsecretChangeWindow = this.openPullsecretChangeWindow.bind(this);
        this.onCancelClicked = this.onCancelClicked.bind(this);
        this.onPresetChangeClicked = this.onPresetChangeClicked.bind(this);
        this.saveAutostartConfig = this.saveAutostartConfig.bind(this);
        this.isAutostartEnabled = this.isAutostartEnabled.bind(this);

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

    async configurationSave(data: State) {
        window.api.configurationSave(data)

        if (this.state.presetChanged) {
            console.log("begin");

            // this should open a modal window to run setup as done with `SetupSpinner` in SetupWindow
            await window.api.openSetupWindow();

            console.log("continue");

            const result = await window.api.showModalDialog('Warning','Before you can use the new preset you have to remove the current CodeReady Containers instance. Are you sure you want to delete the instance? This is a destructive operation and can not be undone.', 'Yes', 'No');
            if(result === 'Yes') {
              window.api.deleteInstance({})
            }
    
        }

        this.setState({"presetChanged": false })

        window.close();
    }

    onPresetChangeClicked() {
        this.setState({"presetChanged": !this.state.presetChanged })
    }

    configurationReset() {
        this.configurationLoad();
    }

    configurationLoad() {
        window.api.configurationLoad({})
        this.setState({"presetChanged": false })
    }

    openPullsecretChangeWindow() {
        window.api.openPullsecretChangeWindow({})
    }
    
    async isAutostartEnabled(): Promise<boolean> {
        return window.api.autoStart.isEnabled()
    }

    saveAutostartConfig(checked: boolean) {
        if (checked) {
            window.api.autoStart.enable()
        } else {
            window.api.autoStart.disable()
        }
    }

    private onCancelClicked(): void {
        window.close();
    }

    render() {
        return (
            <Configuration ref={this.config}
                onSaveClicked={this.configurationSave}
                onResetClicked={this.configurationReset}
                onPullsecretChangeClicked={this.openPullsecretChangeWindow}
                onCancelClicked={this.onCancelClicked}
                onPresetChange={this.onPresetChangeClicked}
                isAutostartEnabled={this.isAutostartEnabled}
                saveAutostartConfig={this.saveAutostartConfig}
                height="320px" />
        );
    }
}
