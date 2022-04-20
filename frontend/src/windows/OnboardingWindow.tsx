import React from 'react';
import {
    Card,
    CardTitle,
    CardBody,
    CardFooter,
    Button,
    Hint,
    HintBody,
    HelperText,
    HelperTextItem,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Checkbox,
    Wizard,
    WizardFooter,
    WizardContextConsumer
} from '@patternfly/react-core';
import InfoIcon from '@patternfly/react-icons/dist/esm/icons/info-icon';
import {
    PullSecretInputCard
} from '../components/PullSecretInputCard';
import { PresetSelection } from '../components/PresetSelection';
import { SetupSpinner } from '../components/SetupSpinner';

interface SetupWindowState {
    stepIdReached: number,
    preset: "openshift" | "podman",
    consentTelemetry: boolean;
    pullsecret: string;
}
export default class OnboardingWindow extends React.Component {
    state: Readonly<SetupWindowState>;
    constructor(props: {}) {
        super(props);

        this.onNext = this.onNext.bind(this);
        this.closeWizard = this.closeWizard.bind(this);
        this.handlePresetSelection = this.handlePresetSelection.bind(this);
        this.handleTelemetryConsent = this.handleTelemetryConsent.bind(this);
        this.handlePullSecretChanged = this.handlePullSecretChanged.bind(this);

        this.state = {
            stepIdReached: 1,
            preset: "openshift",
            consentTelemetry: true,  // for dev-preview releases
            pullsecret: ""
        };

    }

    onNext({ id }: {id?: number | string | undefined}): void {
        if(!id){
            return;
        }
        this.setState({
            stepIdReached: this.state.stepIdReached < id ? id : this.state.stepIdReached
        });
    }

    closeWizard(): void {
        window.api.closeActiveWindow();
    }

    handlePresetSelection(value: string): void {
        console.log(value)

        this.setState(() => {
                return {preset: value};
            }
        );
    }

    handlePullSecretChanged(value: string) {
        this.setState(() => {
                return {pullsecret: value};
            }
        );
    }

    handleTelemetryConsent() {
        this.setState((prevState: SetupWindowState) => {
            return {consentTelemetry: !prevState.consentTelemetry};
        });
    }

    handleFinishedAction() {
        // issue tray start command then close window
        window.api.closeSetupWizard();
    }

    render() {
        const { stepIdReached } = this.state;

        const CustomFooter = (
            <WizardFooter>
              <WizardContextConsumer>
                {({ activeStep, goToStepByName, goToStepById, onNext, onBack, onClose }) => {
                    // Allow to skip the pullsecret step in case of podman
                    if (activeStep.name === "Choose your preset") {
                        return (
                        <>
                            <Button style={{width: 120}} variant="secondary" onClick={onBack}>
                            Back
                            </Button>
                            <Button style={{width: 120}} variant="primary" type="submit" onClick={() =>
                                {
                                    if(this.state.preset === "podman") {
                                        goToStepById(4);
                                    } else {
                                        onNext();
                                    }
                                }}>
                            Next
                            </Button>
                        </>
                        )
                    }
                    if (activeStep.id !== 4) {
                        return (
                        <>
                            <Button style={{width: 120}} variant="secondary" onClick={onBack} className={activeStep.id === 1 ? 'pf-m-disabled' : ''}>
                            Back
                            </Button>
                            <Button style={{width: 120}} variant="primary" type="submit" onClick={onNext}>
                            Next
                            </Button>
                        </>
                        )
                    }
                    // Final step buttons
                    return (
                        <>
                        <Button variant="secondary" onClick={() => goToStepById(1)}>Go to Beginning</Button>
                        <Button style={{width: 120}} onClick={() => onNext()}>Run setup</Button>
                        </>
                    )}}
              </WizardContextConsumer>
            </WizardFooter>
          );


        const steps = [
            { 
                id: 1, 
                name: 'Welcome', 
                component: <Welcome />, 
            },
            { 
                id: 2, 
                name: 'Choose your preset', 
                component: <ChoosePreset 
                    preset={this.state.preset}
                    handlePresetSelection={this.handlePresetSelection}
                />, 

            },
            {
                id: 3,
                name: 'Provide pull secret',
                component: <ProvidePullSecret
                                    handleTextAreaChange={this.handlePullSecretChanged}
                                    pullsecret={this.state.pullsecret}
                                />,
                canJumpTo: stepIdReached >= 2 && this.state.preset === "openshift",
                
            },
            { 
                id: 4, 
                name: 'Review selection', 
                component: <Summary 
                                preset={this.state.preset} 
                                handleTelemetryConsent={this.handleTelemetryConsent} 
                                checked={this.state.consentTelemetry}
                            />, 
                canJumpTo: stepIdReached >= 2,
                nextButtonText: "Run Setup",
            },
            {
                id: 5,
                name: "Run Setup",
                isFinishedStep: true,
                component: <SetupSpinner
                                preset={this.state.preset}
                                consentTelemetry={this.state.consentTelemetry}
                                pullsecret={this.state.pullsecret}
                                skipDaemonStart={false}
                                onFinishClicked={this.handleFinishedAction}
                            />,
            }
        ];
        const title = 'Red Hat OpenShift Local setup wizard';
        const description = 'Guided setup wizard for configuring your operating system and host to run Red Hat OpenShift Local (formerly CodeReady Containers)';
        return (
            <Wizard
                title={title}
                description={description}
                hideClose
                navAriaLabel={`${title} steps`}
                mainAriaLabel={`${title} content`}
                onClose={this.closeWizard}
                steps={steps}
                onNext={this.onNext}
                height={700}
                footer={CustomFooter}
            />
        );
    }
}

const Welcome = () => {
    return (
        <Card isLarge isPlain>
            <CardTitle>Welcome to Red Hat OpenShift Local setup wizard</CardTitle>
            <CardBody>In the next few steps, we’ll ask you a few questions to set up your environment</CardBody>
      </Card>
    );
}

interface ProvidePullSecretProps {
    pullsecret: string;
    handleTextAreaChange: (value: string) => void;
}
const ProvidePullSecret = (props: ProvidePullSecretProps) => {
    return(
        <PullSecretInputCard height="220px"
            pullsecret={props.pullsecret}
            onChanged={props.handleTextAreaChange} />
    );
}
interface ChoosePresetProps {
    preset: string;
    handlePresetSelection: (value: string) => void;
}
const ChoosePreset = (props: ChoosePresetProps) => {
    return(
        <Card isLarge isPlain>
            <CardTitle>Please select the preset you want to use</CardTitle>
            <CardBody>
                <PresetSelection
                    value={props.preset}
                    podmanDescription="Use Podman to run containers inside a VM environment. It will expose the podman command."
                    openshiftDescription="Run a full OpenShift cluster environment as a single node, providing a registry and access to Operator Hub"
                    onPresetChange={props.handlePresetSelection} />
            </CardBody>
            <CardFooter />
        </Card>
    );
}
interface SummaryProps {
    preset: string;
    checked: boolean;
    handleTelemetryConsent: (checked: boolean, event: React.SyntheticEvent) => void;
}
const Summary = (props: SummaryProps) => {
    const telemetryDesc = "Red Hat OpenShift Local uses usage data to constantly improve. " +
        "This can also be changed from the configuration.";

    return (
        <Card isLarge isPlain>
            <CardTitle>You have made the following selection</CardTitle>
            <CardBody isFilled>
                <DescriptionList isHorizontal>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Preset</DescriptionListTerm>
                        <DescriptionListDescription>{props.preset}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListTerm>
                        <Checkbox 
                            id="check-consent-telemetry" 
                            label="Allow telemetry data to be sent to Red Hat" 
                            aria-label="Allow telemetry data to be sent to Red Hat" 
                            description={telemetryDesc || props.checked}
                            onChange={props.handleTelemetryConsent}
                            isChecked={props.checked}
                        />
                    </DescriptionListTerm> 
                </DescriptionList>
            </CardBody>
            <CardFooter>
                <Hint>
                    <HintBody>
                    <HelperText>
                            <HelperTextItem icon={<InfoIcon />}>You can go back and change your selection</HelperTextItem>
                        </HelperText>
                    </HintBody>
                </Hint>
            </CardFooter>
        </Card>
    )
}
