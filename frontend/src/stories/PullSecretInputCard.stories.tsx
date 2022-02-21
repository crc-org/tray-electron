import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { PullSecretInputCard } from '../components/PullSecretInputCard';

export default {
  title: 'Example/PullSecretInputCard',
  component: PullSecretInputCard,
  argTypes: {
  },
}as ComponentMeta<typeof PullSecretInputCard>;

const Template: ComponentStory<typeof PullSecretInputCard> = (args) => <PullSecretInputCard {...args} />;

export const Default = Template.bind({});
Default.args = {
};
