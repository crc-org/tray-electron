import { Button } from '@patternfly/react-core/dist/esm/components/Button';
import React from 'react';
import { DialogOptions } from '../../global';

const initialState: DialogOptions = {
  buttons: [],
  message: 'No message',
  title: 'No title',
};
export class DialogWindow extends React.Component {

  state: DialogOptions;
  constructor(props: {}) {
    super(props);
    this.state = initialState;
  }

  async componentDidMount(): Promise<void> {
    const options = await window.dialogApi.getDialogOptions();
    this.setState(options);
    document.title = options.title;
  }

  private onButtonClick(item: string): void {
    window.dialogApi.buttonClicked(item);
  }

  render(): React.ReactNode {
    let counter = 0;
    return (
      <div style={{ paddingTop: "30px", paddingLeft: "30px", paddingRight: "30px" }}>
        <div style={{ height: "80px" }}>
          {this.state.message}
        </div>
        <div style={{ textAlign: "right" }}>
          {this.state.buttons.map(item => {
            counter++;
            return (
            <Button key={item} variant={counter === 1 ? "primary" : "secondary"} style={{ marginLeft: "10px" }}
              onClick={() => this.onButtonClick(item)}>
              {item}
            </Button>)
          })}
        </div>
      </div>
    )
  }
}
