import React from 'react';
import {
    Card,
    CardTitle,
    CardBody,
    CardFooter,
    Button,
    ButtonVariant,
    Hint,
    HintBody,
    HelperText,
    HelperTextItem,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Checkbox,
    EmptyState,
    EmptyStateBody,
    EmptyStateSecondaryActions,
    EmptyStatePrimary,
    Wizard,
    WizardFooter,
    WizardContextConsumer
} from '@patternfly/react-core';
import InfoIcon from '@patternfly/react-icons/dist/esm/icons/info-icon';
import {
    LogWindow,
    PresetSelection,
    PullSecretInputCard
} from '@code-ready/crc-react-components';

interface SetupSpinnerProps {
    preset: string;
    consentTelemetry: boolean;
    pullsecret: string;
}
interface SetupSpinnerState {
    notReadyForUse: boolean;
}
class SetupSpinner extends React.Component<SetupSpinnerProps> {

    state: Readonly<SetupSpinnerState>;

    private logWindow: React.RefObject<LogWindow>;

    constructor(props: SetupSpinnerProps) {
        super(props)

        this.state = {
            notReadyForUse: true,
        };

        this.handlePrimaryButtonAction = this.handlePrimaryButtonAction.bind(this);

        this.logWindow = React.createRef();
    }

    componentDidMount() {
        // start the crc setup process
        // different configs needed will be passed as args
        window.api.onSetupLogs(async (event, message) => {
            this.logWindow.current!.log(message);
        })
        window.api.onSetupEnded(async (event, message) => {
            this.setState({ notReadyForUse: false });
        })
        window.api.startSetup({
            preset: this.props.preset,
            consentTelemetry: this.props.consentTelemetry,
            pullsecret: this.props.pullsecret
        })
    }

    componentWillUnmount() {
        window.api.removeSetupLogListeners();
    }

    handlePrimaryButtonAction() {
        // issue tray start command then close window
        window.api.closeSetupWizard();
    }

    handleDocsLinks(url: string) {
        window.api.openLinkInDefaultBrowser(url)
    }

    render () {
        return (
            <EmptyState>
                <EmptyStateBody>
                    <LogWindow ref={this.logWindow} rows={14} cols={110} />
                </EmptyStateBody>
                <EmptyStatePrimary>
                    <Button isDisabled={this.state.notReadyForUse} variant={ButtonVariant.primary} onClick={this.handlePrimaryButtonAction}>Start using CRC</Button>
                </EmptyStatePrimary>
                <EmptyStateSecondaryActions>
                    <Button variant={ButtonVariant.link} onClick={ () => { this.handleDocsLinks("https://crc.dev") }}>Visit Getting started Guide</Button>
                    <Button variant={ButtonVariant.link} onClick={ () => { this.handleDocsLinks("https://crc.dev") }}>Example Deployments</Button>
                </EmptyStateSecondaryActions>
            </EmptyState>
        );
    }
}
interface SetupWindowState {
    stepIdReached: number,
    preset: "openshift" | "podman",
    consentTelemetry: boolean;
    pullsecret: string;
}
export default class SetupWindow extends React.Component {
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
                            />,
            }
        ];
        const title = 'CodeReady Containers setup wizard';
        const description = 'Guided setup wizard for configuring your operating system and host to run CodeReady Containers';
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
            <CardTitle>Welcome to CodeReady Containers</CardTitle>
            <CardBody>In the next few steps we'll ask you a few questions to setup your environment</CardBody>
            <CardFooter>Please click 'Next' to proceed</CardFooter>
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
                    podmanDescription="This option will allow you to use podman to run containers inside a VM environment."
                    openshiftDescription="This option will run a full cluster environment as a single node, providing a registry, monitoring and access to Operator Hub"
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
    const telemetryDesc = "CodeReady Containers is constantly improving and we would like to know more about usage. " +
        "For preview releases this information is very valuable to resolve issues and can therefore not be turned off at this time."
        //"Your preference can be changed manually if desired from the settings dialog.";

    return (
        <Card isLarge isPlain>
            <CardTitle>Thank you. You have made the following selection</CardTitle>
            <CardBody isFilled>
                <DescriptionList isHorizontal>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Preset</DescriptionListTerm>
                        <DescriptionListDescription>{props.preset}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListTerm>
                        <Checkbox 
                            id="check-consent-telemetry" 
                            label="Allow to send telemetry data to Red Hat" 
                            aria-label="Allow to send telemetry data to Red Hat" 
                            description={telemetryDesc || props.checked}
                            onChange={props.handleTelemetryConsent}
                            isChecked={props.checked}
                            isDisabled={true}  // can't be changed for dev-preview
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
