import React from 'react';
import {
    Button,
    Bullseye,
} from '@patternfly/react-core';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import {
    PullSecretInputCard
} from '../components/PullSecretInputCard';

interface State {
    pullsecret: string;
}
export default class PullSecretChangeWindow extends React.Component {
    state: Readonly<State>;

    constructor(props: {}) {
      super(props);
      this.state = {
          pullsecret: ""
      };
  
      this.handlePullSecretChanged = this.handlePullSecretChanged.bind(this);
      this.handleChangeClick = this.handleChangeClick.bind(this);
      this.handleCancelClick = this.handleCancelClick.bind(this);
    }
  
    handlePullSecretChanged = (value: string)  => {
        this.setState(() => {
                return {pullsecret: value};
            }
        );
    };

    handleChangeClick() {
        window.api.pullsecretChange({pullsecret: this.state.pullsecret})

        // clear field
        this.setState({pullsecret: ""});

        window.close();
    }

    handleCancelClick() {
        // clear field
        this.setState({pullsecret: ""});

        window.close();
    }

    render() {
      return (
        <>
            <Bullseye>
                <PullSecretInputCard height="220px"
                    pullsecret={this.state.pullsecret}
                    onChanged={this.handlePullSecretChanged} />
            </Bullseye>
            <div style={{ textAlign: "right", paddingLeft: "30px", paddingRight: "30px" }}>
                <Button style={{width: 120}} variant="secondary"
                    onClick={this.handleCancelClick}>
                    Cancel
                </Button>{' '}
                <Button style={{width: 120}} variant="primary" type="submit"
                    onClick={this.handleChangeClick} icon={<SaveIcon />}>
                    Save
                </Button>
            </div>
        </>
      );
    }
}

