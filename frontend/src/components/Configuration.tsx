import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Form, FormGroup,
    TextInput, NumberInput,
    Checkbox,
    Tab, Tabs, TabTitleText,
    TabContentBody
} from '@patternfly/react-core';

import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';

import "./Configuration.scss";

import { PresetSelection } from './PresetSelection';

import '@patternfly/react-styles/css/components/InputGroup/input-group.css';

export interface ConfigurationProps {
    readonly height: string;
    readonly textInputWidth: number;
    onPullsecretChangeClicked: (event: React.SyntheticEvent) => void;
    onSaveClicked: (state: State) => void;
    onResetClicked: () => void;
    onPresetChange: (preset: string) => void;
    onCancelClicked: () => void;
}

export interface State {
    readonly preset: string;
    readonly cpus: number;
    readonly memory: number;
    readonly 'disk-size': number;
    readonly 'consent-telemetry': string;
    readonly 'http-proxy': string;
    readonly 'https-proxy': string;
    readonly 'no-proxy': string;
    readonly "proxy-ca-file": string;
    readonly [key: string]: string | number;
}
export class Configuration extends React.Component<ConfigurationProps> {
    static propTypes = {
        onSaveClicked: PropTypes.func,
        onResetClicked: PropTypes.func,
        onPullsecretChangeClicked: PropTypes.func,
        onPresetChange: PropTypes.func,
        height: PropTypes.string,
        textInputWidth: PropTypes.string
    };

    static defaultProps = {
        height: "300px",
        textInputWidth: "320px"
    };

    static openshiftDefaults: any = {
        cpus: 4,
        memory: 9126,
        'disk-size': 31
    }

    static podmanDefaults: any = {
        cpus: 1,
        memory: 2048,
        'disk-size': 31
    }

    state: State;
    constructor(props: ConfigurationProps) {
        super(props);
        this.state = {
            activeTabKey: 0,
            preset: "unknown",
            cpus: 0,
            memory: 0,
            'disk-size': 0,
            'consent-telemetry': "no",
            'http-proxy': "",
            'https-proxy': "",
            'no-proxy': "",
            "proxy-ca-file": ""
        };

        this.configurationSaveClicked = this.configurationSaveClicked.bind(this);
        this.configurationResetClicked = this.configurationResetClicked.bind(this);
        this.handleTabClick = this.handleTabClick.bind(this);

        this.updateClampedValue = this.updateClampedValue.bind(this);
        this.getMimimum = this.getMimimum.bind(this);
        this.updateValue = this.updateValue.bind(this);
        this.presetChanged = this.presetChanged.bind(this)
    }

    // Toggle currently active tab
    handleTabClick(event: React.SyntheticEvent, tabIndex: number | string): void {
        this.setState({
            activeTabKey: tabIndex
        });
    };

    updateValues(values: State) {
        const self = this; // make sure 'self' references to this
        Object.entries(values).forEach(function(value) {
            self.updateValue(value[0], value[1]);
        });
    }

    getMimimum(key: string) {
        if(this.state.preset === "openshift") {
            return Configuration.openshiftDefaults[key];
        }
        if(this.state.preset === "podman") {
            return Configuration.podmanDefaults[key];
        }
        return 0;
    }

    updateClampedValue(key: string, value: number): void {
        const min = this.getMimimum(key);
        if(value < min) {
            value = min;
        }
        this.updateValue(key, value);
    }

    updateValue(key: string, value: unknown) {
        if(this.state["" + key] !== undefined) {
            const newState = { ["" + key]: value };
            this.setState(newState);
        }
    }

    presetChanged(value: string) {
        this.updateValue("preset", value)
        if(value === "openshift") {
            this.updateValues(Configuration.openshiftDefaults);
        }
        if(value === "podman") {
            this.updateValues(Configuration.podmanDefaults);
        }
        this.props.onPresetChange(value);
    }

    configurationSaveClicked() {
        this.props.onSaveClicked(this.state);
    }

    configurationResetClicked() {
        this.props.onResetClicked();
    }

    render() {
        const {activeTabKey } = this.state;

        const tabStyle = {
            height: this.props.height,
        }

        const proxyInputStyle = {
            width: this.props.textInputWidth
        }

        return (
            <div>
                <Tabs activeKey={activeTabKey} onSelect={this.handleTabClick} isBox={true}>

                    <Tab eventKey={0} title={<TabTitleText>Basic</TabTitleText>}>
                        <TabContentBody style={tabStyle} hasPadding>
                            <Form isHorizontal>
                                <FormGroup fieldId='settings-cpu' label="CPU">
                                    <NumberInput id='settings-cpu'
                                        className="cpus"
                                        inputName="cpus"
                                        minusBtnAriaLabel="minus"
                                        plusBtnAriaLabel="plus"
                                        unit=""
                                        min={1}
                                        value={this.state.cpus}
                                        widthChars={6}
                                        onPlus={event => this.updateValue('cpus', this.state.cpus + 1)}
                                        onMinus={event => this.updateClampedValue('cpus', this.state.cpus - 1)}
                                        onChange={value => this.state['cpus'] } 
                                        />
                                </FormGroup>
                                <FormGroup fieldId='settings-memory' label="Memory">
                                    <NumberInput id='settings-memory'
                                        className="memory"
                                        inputName="memory"
                                        minusBtnAriaLabel="minus"
                                        plusBtnAriaLabel="plus"
                                        unit="MiB"
                                        min={8192}
                                        value={this.state.memory}
                                        widthChars={6}
                                        onPlus={event => this.updateValue('memory', this.state.memory + 512)}
                                        onMinus={event => this.updateClampedValue('memory', this.state.memory - 512)}
                                        onChange={value => this.state['memory'] } 
                                        />
                                </FormGroup>
                                <FormGroup fieldId='settings-disksize' label="Disk size">
                                    <NumberInput id='settings-disksize'
                                        className="disk-size"
                                        inputName="disk-size"
                                        minusBtnAriaLabel="minus"
                                        plusBtnAriaLabel="plus"
                                        unit="GB"
                                        min={20}
                                        value={this.state["disk-size"]}
                                        widthChars={6}
                                        onPlus={event => this.updateValue('disk-size', this.state["disk-size"] + 1)}
                                        onMinus={event => this.updateClampedValue('disk-size', this.state["disk-size"] - 1)}
                                        onChange={value => this.state['disk-size'] }
                                        />
                                </FormGroup>
                                <FormGroup fieldId='settings-preset' label="Preset">
                                    <PresetSelection id="settings-preset" isCompact
                                        className="preset"
                                        value={this.state["preset"]}
                                        onPresetChange={value => this.presetChanged(value)} />
                                </FormGroup>
                            </Form>
                        </TabContentBody>
                    </Tab>

                    <Tab eventKey={1} title={<TabTitleText>Other</TabTitleText>}>
                        <TabContentBody style={tabStyle} hasPadding>
                            <Form isHorizontal>
                                <FormGroup fieldId='config-telemetry' label="Telemetry">
                                    <Checkbox id='config-consentTelemetry'
                                        className="consentTelemetry"
                                        isChecked={this.state["consent-telemetry"] === "yes" ? true : false }
                                        onChange={value => this.updateValue('consent-telemetry', value === true ? "yes" : "no")}
                                        label="Allow telemetry data to be sent to Red Hat"
                                        description="Allow basic information about the system and cluster to be collected for development and debugging purposes" />
                                </FormGroup>
                            </Form>
                        </TabContentBody>
                    </Tab>
                    
                    <Tab eventKey={2} title={<TabTitleText>Proxy</TabTitleText>}>
                        <TabContentBody style={tabStyle} hasPadding>
                            <Form isHorizontal>
                                <FormGroup fieldId='config-proxy' label="HTTP proxy">
                                    <TextInput style={proxyInputStyle} id='config-http-proxy'
                                            className="proxy"
                                            value={this.state["http-proxy"]}
                                            onChange={value => this.updateValue('http-proxy', value)} />
                                </FormGroup>
                                <FormGroup fieldId='config-proxy' label="HTTPS proxy">
                                    <TextInput style={proxyInputStyle} id='config-https-proxy'
                                            className="proxy"
                                            value={this.state["https-proxy"]}
                                            onChange={value => this.updateValue('https-proxy', value)} />
                                </FormGroup>
                                <FormGroup fieldId='config-proxy' label="No proxy">
                                    <TextInput style={proxyInputStyle} id='config-no-proxy'
                                            className="proxy"
                                            value={this.state["no-proxy"]}
                                            onChange={value => this.updateValue('no-proxy', value)} />
                                </FormGroup>
                                <FormGroup fieldId='config-proxy' label="Proxy CA file">
                                    <TextInput style={proxyInputStyle} id='config-proxy-ca-file'
                                            className="proxy"
                                            value={this.state["proxy-ca-file"]}
                                            onChange={value => this.updateValue('proxy-ca-file', value)} />
                                </FormGroup>
                            </Form>
                        </TabContentBody>
                    </Tab>

                    <Tab eventKey={3} title={<TabTitleText>OpenShift</TabTitleText>} isDisabled={ this.state.preset !== "openshift" }>                    
                      <TabContentBody style={tabStyle} hasPadding>
                            <Form isHorizontal>
                                <FormGroup fieldId='config-pullsecret' label="Pullsecret">
                                    <Button onClick={this.props.onPullsecretChangeClicked} variant="primary">Change</Button>
                                </FormGroup>
                            </Form>
                        </TabContentBody>
                    </Tab>

                </Tabs>

                <div style={{textAlign:"right", paddingRight: 15}}>
                    <Button variant="secondary" onClick={this.configurationResetClicked}>Reset</Button>
                    {' '}
                    <Button variant='secondary' onClick={this.props.onCancelClicked}>Cancel</Button>
                    {' '}
                    <Button variant="primary" onClick={this.configurationSaveClicked} icon={<SaveIcon />}>Save</Button>
                </div>
            </div>
        );
    }
}
