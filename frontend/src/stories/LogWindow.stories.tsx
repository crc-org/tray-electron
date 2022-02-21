import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { LogWindow } from '../components/LogWindow';

export default {
  title: 'Example/LogWindow',
  component: LogWindow,
  argTypes: {
  },
}as ComponentMeta<typeof LogWindow>;

let logWindow: React.RefObject<LogWindow> = React.createRef();
const Template: ComponentStory<typeof LogWindow> = (args) => <LogWindow ref={logWindow} {...args} />;

export const Default = Template.bind({});
Default.args = {
  cols: 60,
  rows: 20,
};

/*
setInterval(function() {
  logWindow.current.log("Lorem ipsum");
}, 1000);
*/
