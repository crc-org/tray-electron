import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import {Actions} from '../components/Actions';

export default {
  title: 'Example/Actions',
  component: Actions,
  argTypes: {
  },
} as ComponentMeta<typeof Actions>;

const Template: ComponentStory<typeof Actions> = (args) => <Actions {...args} />;

export const Default = Template.bind({});
Default.args = {
};
