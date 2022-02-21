import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import {Status} from '../components/Status';

export default {
  title: 'Example/Status',
  component: Status,
  argTypes: {
  },
}as ComponentMeta<typeof Status>;

const Template: ComponentStory<typeof Status> = (args) => <Status {...args} />;

export const Default = Template.bind({});
Default.args = {
};
