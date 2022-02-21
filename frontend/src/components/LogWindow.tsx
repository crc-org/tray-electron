import React from 'react';
import PropTypes from 'prop-types';

import "./LogWindow.scss";

interface State {
    readonly log: string;
}
export interface LogWindowProps {
    readonly width?: string;
    readonly height?: string;
    readonly rows: number | undefined;
    readonly cols: number | undefined;
}
export class LogWindow extends React.Component<LogWindowProps> {
    static propTypes = {
        rows: PropTypes.number,
        cols: PropTypes.number,
        width: PropTypes.string,
        height: PropTypes.string
    };

    static defaultProps = {
        rows: 20,
        cols: 80
    };

    state: State;
    private textAreaLog: React.RefObject<HTMLTextAreaElement>;

    constructor(props: LogWindowProps) {
        super(props);
        this.state = {
            log: "",
        };

        this.log = this.log.bind(this);
        this.clear = this.clear.bind(this);

        this.textAreaLog = React.createRef();
    }

    componentDidUpdate() {
        this.textAreaLog.current!.scrollTop = this.textAreaLog.current!.scrollHeight;
    }

    log(value: string): void {
        const oldstate = this.state.log;
        // prevent double newlines
        const newline = value.endsWith("\n") ? "" : "\r\n";
        const newState = { log: oldstate + value + newline };
        this.setState(newState);
        
    }

    clear() {
        const newState = { log: "" };
        this.setState(newState);
    }

    render() {
        const style: React.CSSProperties = {
            backgroundColor: "black",
            color: "white",
            resize: "none",
            border: "0px"
        };

        if (this.props.width !== "") {
            style.width = this.props.width
        }
        if (this.props.height !== "") {
            style.height = this.props.height
        }

        return (
            <div>
                <textarea ref={this.textAreaLog} 
                    style={style} readOnly 
                    rows={this.props.rows} cols={this.props.cols} name="crc-log"
                    value={this.state.log}
                    />
            </div>
        );
    }
}
