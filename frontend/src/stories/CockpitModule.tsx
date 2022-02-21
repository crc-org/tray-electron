import React from 'react';
import {
    Card,
    Page,
    PageSection,
    Text,
    TextContent
} from '@patternfly/react-core';

import {ControlCard} from '../components/ControlCard';
import {Configuration} from '../components/Configuration';
import {LogWindow} from '../components/LogWindow';

export function CockpitModule({controlCardArgs, logWindowArgs, configurationArgs}: any) {
    return (
        <Page>
            <PageSection>
                <TextContent>
                    <Text component="h2">Status</Text>
                </TextContent>
                <ControlCard {...controlCardArgs}/>
            </PageSection>
            <PageSection>
                <TextContent>
                    <Text component="h2">Logs</Text>
                </TextContent>
                <Card style={{ padding: "20px" }}>
                    <LogWindow width="100%" {...logWindowArgs} />
                </Card>
            </PageSection>
            <PageSection>
                <TextContent>
                    <Text component="h2">Configuration</Text>
                </TextContent>
                <Card style={{ padding: "20px" }}>
                    <Configuration height="420px" {...configurationArgs} />
                </Card>
            </PageSection>
        </Page>
  );
}
