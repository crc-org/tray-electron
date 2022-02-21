import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { OpenShiftStatus } from '../components/OpenShiftStatus';

export default {
  title: 'Example/OpenShiftStatus',
  component: OpenShiftStatus,
  argTypes: {
  },
}as ComponentMeta<typeof OpenShiftStatus>;

const Template: ComponentStory<typeof OpenShiftStatus> = (args) => <OpenShiftStatus {...args} />;

export const Default = Template.bind({});
Default.args = {
};
