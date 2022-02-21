import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Configuration } from '../components/Configuration';

export default {
  title: 'Example/Configuration',
  component: Configuration,
  argTypes: {
  },
}as ComponentMeta<typeof Configuration>;

const Template: ComponentStory<typeof Configuration> = (args) => <Configuration {...args} />;

export const Default = Template.bind({});
Default.args = {
  
};

