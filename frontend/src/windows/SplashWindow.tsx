import React from 'react';
import {  
    Text,
    Brand, 
    Button, 
    ButtonVariant, 
    Bullseye, 
    Page, 
    PageSection,
    PageSectionVariants,
    TextVariants,
} from '@patternfly/react-core';
import logo from '../assets/crc-logo-white.png';
import { useNavigate } from 'react-router-dom';

export default class SplashWindow extends React.Component {
  render() { 
    return (
      <Page>
        <PageSection sticky="top" variant={PageSectionVariants.darker} isWidthLimited hasShadowBottom={false} style={{height:"420px"}}>
          <Bullseye>
            <LogoBanner />
          </Bullseye>
        </PageSection>
        <PageSection variant={PageSectionVariants.dark} isWidthLimited hasShadowBottom={false} hasShadowTop={false}>
            <Bullseye>
              <Text component={TextVariants.h3}>
              Welcome to CodeReady Containers. Let’s get started.
              </Text>
            </Bullseye>
        </PageSection>
        <PageSection sticky="bottom" variant={PageSectionVariants.light} isFilled hasShadowBottom={false} hasShadowTop={false}>
          <Bullseye style={{ paddingTop: "70px" }}>
            <GetStartedButton />
          </Bullseye>
        </PageSection>
      </Page>
      );
    }
}

const LogoBanner = () => {
    return (
        <Brand src={logo} alt="CRC Logo" className="pf-u-w-25"/>
    );
}

const GetStartedButton = () => {
    let navigate = useNavigate();
    let showSetupWizard = () => {
        navigate('/setup');
    }

    return (
        <Button variant={ButtonVariant.primary} isLarge onClick={showSetupWizard}> Get started </Button>
    );
}
