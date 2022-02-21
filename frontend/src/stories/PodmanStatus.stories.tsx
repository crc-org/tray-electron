import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { PodmanStatus } from '../components/PodmanStatus';

export default {
  title: 'Example/PodmanStatus',
  component: PodmanStatus,
  argTypes: {
  },
}as ComponentMeta<typeof PodmanStatus> ;

const Template: ComponentStory<typeof PodmanStatus> = (args) => <PodmanStatus {...args} />;

export const Default = Template.bind({});
Default.args = {
};
