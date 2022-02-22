import PropTypes from 'prop-types';
import React from 'react';
import {
    Card, CardTitle, CardBody, CardFooter,
    TextArea,
    Hint, HintTitle,
    HelperText, HelperTextItem
} from '@patternfly/react-core';
import InfoIcon from '@patternfly/react-icons/dist/esm/icons/info-icon';

import "./PullSecretInputCard.scss";

export interface PullSecretInputCardProps {
    readonly height: string;
    readonly pullsecret: string;
    onChanged: (value: string) => void;
}
export class PullSecretInputCard extends React.Component<PullSecretInputCardProps> {
    static propTypes = {
        pullsecret: PropTypes.string,
        height: PropTypes.string,
        onChanged: PropTypes.func
    }
    
    static defaultProps = {
        height: "240px"
    };
    constructor(props: PullSecretInputCardProps) {
        super(props);
        this.state = {
        }
    }
    
    render() {
        const style: React.CSSProperties = {
            resize: "none",
            height: this.props.height
        };

        return (
            <Card isLarge isPlain>
                <CardTitle>Provide a pull secret</CardTitle>
                <CardBody>
                    <TextArea id="pullsecretEntry"
                        style={style} autoResize={false}
                        value={this.props.pullsecret} onChange={this.props.onChanged} />
                </CardBody>
                <CardFooter>
                    <Hint>
                        <HintTitle>
                            <HelperText>
                            <HelperTextItem icon={<InfoIcon />}>To pull container images from the registry, a pull secret is necessary.
                                You can get a pull secret from the <a target="_blank"
                                rel="noreferrer" href="https://cloud.redhat.com/openshift/create/local">CodeReady Containers download page</a>.
                                Use the "Copy pull secret" option and paste the content into the field above.</HelperTextItem>
                            </HelperText>
                        </HintTitle>
                    </Hint>
                </CardFooter>
            </Card>
        );
    }
}
