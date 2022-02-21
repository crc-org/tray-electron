import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@patternfly/react-core';

import "./PresetSelection.scss";

export interface PresetSelectionProps {
    readonly value: string;
    readonly podmanDescription: string;
    readonly openshiftDescription: string;
    readonly isCompact?: boolean;
    readonly id?: string;
    readonly className?: string;
    onPresetChange?: (value: string) => void;
}

interface State {
    readonly presetSelected: string;
}
export class PresetSelection extends React.Component<PresetSelectionProps> {
    static propTypes = {
        value: PropTypes.string,
        podmanDescription: PropTypes.string,
        openshiftDescription: PropTypes.string,
        onPresetChange: PropTypes.func
    }
    
    static defaultProps = {
        value: "unknown",
        podmanDescription: "This option will allow you to use podman to run containers inside a VM environment.",
        openshiftDescription: "This option will run a full cluster environment as a single node, providing a registry, monitoring and access to Operator Hub"
    }; 

    private description: string;
    state: State;
    constructor(props: PresetSelectionProps) {
        super(props);
        this.state = {
            presetSelected: this.props.value
        }
        this.description = "";

        this.handlePresetSelectClick = this.handlePresetSelectClick.bind(this);
        this.updatePresetDescription = this.updatePresetDescription.bind(this);
    }

    handlePresetSelectClick = (event: React.SyntheticEvent, value: string) => {
        this.setState({ presetSelected: value });

        this.updatePresetDescription(value);

        if(this.props.onPresetChange) {
            this.props.onPresetChange(value);
        }
    };

    updatePresetDescription(value: string): void {
        if(value === "podman") {
            this.description = this.props.podmanDescription;
        }
        if(value === "openshift") {
            this.description = this.props.openshiftDescription;
        }
    }

    componentWillReceiveProps(nextProps: PresetSelectionProps) : void{
        this.setState({
           presetSelected: nextProps.value
        })

        this.updatePresetDescription(nextProps.value);
    }

    render() {
        var compactTemplate = (
            <>
                <div role="group">
                    <Button className="preset-selection-button-compact"
                        variant={ (this.state.presetSelected === "openshift") ? "primary" : "secondary" }
                        onClick={ event => this.handlePresetSelectClick(event, 'openshift') }>OpenShift</Button>
                    <Button className="preset-selection-button-compact"
                        variant={ (this.state.presetSelected === "podman") ? "primary" : "secondary" }
                        onClick={ event => this.handlePresetSelectClick(event, 'podman') }>Podman</Button>
                </div>
                <span className="preset-description">{this.description}</span>
            </>
        )

        var regularTemplate = (
            <>
                <div role="group">
                    <Button isLarge className="preset-selection-button"
                        variant={ (this.state.presetSelected === "openshift") ? "primary" : "secondary" }
                        onClick={ event => this.handlePresetSelectClick(event, 'openshift') }>OpenShift</Button>
                    <span className="preset-description">{this.props.openshiftDescription}</span>
                    <Button isLarge className="preset-selection-button"
                        variant={ (this.state.presetSelected === "podman") ? "primary" : "secondary" }
                        onClick={ event => this.handlePresetSelectClick(event, 'podman') }>Podman</Button>
                    <span className="preset-description">{this.props.podmanDescription}</span>
                </div>
            </>
        )

        return (
            this.props.isCompact ? compactTemplate : regularTemplate
        );
    }
}
