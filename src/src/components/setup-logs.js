import React from 'react';
import {
    Title,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    CodeBlock,
    CodeBlockCode,
    EmptyStateSecondaryActions,
    EmptyStatePrimary,
    Button,
    ButtonVariant} from '@patternfly/react-core';

class SetupSpinner extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            setupLogs: "",
        }
        this.handlePrimaryButtonAction = this.handlePrimaryButtonAction.bind(this);
    }

    componentDidMount() {
        // start the crc setup process
        // different configs needed will be passed as props
        console.log("Its mounted");
    }

    handlePrimaryButtonAction() {
        // issue tray start command then close window
        window.api.closeActiveWindow();
    }

    render () {
        const Spinner = () => (
            <span className="pf-c-spinner" role="progressbar" aria-valuetext="Running Setup...">
              <span className="pf-c-spinner__clipper" />
              <span className="pf-c-spinner__lead-ball" />
              <span className="pf-c-spinner__tail-ball" />
            </span>
        )

        return (
            <EmptyState>
                <EmptyStateIcon variant="container" component={Spinner} />
                <Title size="lg" headingLevel="h4">
                    Running Setup
                </Title>
                <EmptyStateBody>
                    <CodeBlock>
                        <CodeBlockCode id="setup-logs">{this.state.setupLogs}</CodeBlockCode>
                    </CodeBlock>
                </EmptyStateBody>
                <EmptyStatePrimary>
                    <Button variant={ButtonVariant.primary} onClick={this.handlePrimaryButtonAction}>Close window and start crc</Button>
                </EmptyStatePrimary>
                <EmptyStateSecondaryActions>
                    <Button variant={ButtonVariant.link} component="a" href="https://crc.dev">Visit Getting started Guide</Button>
                    <Button variant={ButtonVariant.link} component="a" href="https://crc.dev">Example Deployments</Button>
                </EmptyStateSecondaryActions>
            </EmptyState>
        );
    }
}

export default SetupSpinner;