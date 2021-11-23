import React from 'react';
import { Wizard } from '@patternfly/react-core';

export default class OnboardingWizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stepIdReached: 1
    };
    this.onNext = ({ id }) => {
      this.setState({
        stepIdReached: this.state.stepIdReached < id ? id : this.state.stepIdReached
      });
    };
    this.closeWizard = () => {
      console.log("close wizard");
    }
  }

  render() {
    const { stepIdReached } = this.state;

    const steps = [
      { id: 1, name: 'Welcome', component: <p>Welcome to CodeReady Containers</p> },
      { id: 2, name: 'Choose your environment', component: <p>What would you want to use CRC for?</p>, canJumpTo: stepIdReached >= 2 },
      { id: 3, name: 'Review selection', component: <p>Thank you. You made the following selection</p>, canJumpTo: stepIdReached >= 3 },
      { id: 4, name: 'Summary', component: <p>All set up. CodeReady Containers is now ready for use</p>, nextButtonText: 'Finish', canJumpTo: stepIdReached >= 4 }
    ];
    const title = 'CodeReady Containers setup wizard';
    const description = 'Guided setup wizard for configuring your operating system and host to run CodeReady Containers';
    return (
      <Wizard
        title={title}
        description={description}
        navAriaLabel={`${title} steps`}
        mainAriaLabel={`${title} content`}
        onClose={this.closeWizard}
        steps={steps}
        onNext={this.onNext}
        height={550}
      />
    );
  }
}