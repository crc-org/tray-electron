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

export const SplashScreen = () => {
    return (
    <Page>
      <PageSection sticky="top" variant={PageSectionVariants.darker} isWidthLimited hasShadowBottom={false}>
        <Bullseye>
          <LogoBanner />
        </Bullseye>
      </PageSection>
      <PageSection variant={PageSectionVariants.dark} isWidthLimited hasShadowBottom={false} hasShadowTop={false}>
          <Bullseye>
            <Text component={TextVariants.h3}>
                Welcome to CodeReady Containers. Before you can start using CRC, we need to ask you some questions, Please click below to get started.
            </Text>
          </Bullseye>
      </PageSection>
      <PageSection sticky="bottom" variant={PageSectionVariants.light} isFilled hasShadowBottom={false} hasShadowTop={false}>
        <Bullseye>
            <ActionButton />
        </Bullseye>
      </PageSection>
    </Page>
    );
}

const LogoBanner = () => {
    return (
        <Brand src={logo} alt="CRC Logo" className="pf-u-w-25"/>
    );
}

const ActionButton = () => {
    let navigate = useNavigate();
    let showSetupWizard = () => {
        console.log("clicked")
        navigate('/setup');
    }

    return (
        <Button variant={ButtonVariant.primary} isLarge onClick={showSetupWizard}> Get Started </Button>
    );
}
