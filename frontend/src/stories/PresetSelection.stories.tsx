import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { PresetSelection } from '../components/PresetSelection';

export default {
  title: 'Example/PresetSelection',
  component: PresetSelection,
  argTypes: {
  },
}as ComponentMeta<typeof PresetSelection>;

const Template: ComponentStory<typeof PresetSelection> = (args) => <PresetSelection {...args} />;

export const Default = Template.bind({});
Default.args = {
};
