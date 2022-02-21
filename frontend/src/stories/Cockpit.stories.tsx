import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { CockpitModule } from './CockpitModule';

export default {
  title: 'Design/Cockpit',
  component: CockpitModule
} as ComponentMeta<typeof CockpitModule>;

const Template: ComponentStory<typeof CockpitModule>  = (args) =>  <CockpitModule {...args} />

export const Default = Template.bind({});
Default.args = {
};
