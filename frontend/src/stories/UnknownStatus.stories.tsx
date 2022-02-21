import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import {UnknownStatus} from '../components/UnknownStatus';

export default {
  title: 'Example/UnknownStatus',
  component: UnknownStatus,
  argTypes: {
  },
}as ComponentMeta<typeof UnknownStatus>;

const Template: ComponentStory<typeof UnknownStatus> = (args) => <UnknownStatus {...args} />;

export const Default = Template.bind({});
Default.args = {
};
