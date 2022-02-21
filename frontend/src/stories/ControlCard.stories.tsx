import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import {ControlCard} from '../components/ControlCard';

export default {
  title: 'Example/ControlCard',
  component: ControlCard,
  argTypes: {
  },
} as ComponentMeta<typeof ControlCard>;

const Template: ComponentStory<typeof ControlCard> = (args) => <ControlCard {...args} />;

export const Default = Template.bind({});
Default.args = {
};
