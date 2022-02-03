import React from 'react';
import { Bullseye, Button } from "@patternfly/react-core";
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';
import GithubIcon from '@patternfly/react-icons/dist/esm/icons/github-icon';
import { Versions } from '../../global';

import styles from './AboutWindow.module.scss';

export class AboutWindow extends React.Component {
  state: Versions;
  constructor(props: {}) {
    super(props);
    this.state = {}
    this.openDocumentation = this.openDocumentation.bind(this);
    this.openRepo = this.openRepo.bind(this);
  }

  async componentDidMount(): Promise<void> {
    // need to set title there, as index.html contains '<title>'
    window.document.title = "About";
    const versions = await window.api.about();
    this.setState(versions);
  }

  private openDocumentation(): void {
    window.api.openLinkInDefaultBrowser(`https://access.redhat.com/documentation/en-us/red_hat_codeready_containers/${this.state.crcVersion}`);
  }

  private openRepo(): void {
    window.api.openLinkInDefaultBrowser('https://github.com/code-ready/tray-electron');
  }

  render(): React.ReactNode {

    let bundleVersion: React.ReactNode;
    if (this.state.ocpBundleVersion) {
      bundleVersion = <Version title='Red Hat OpenShift Container Platform version' version={this.state.ocpBundleVersion} />
    } else if (this.state.podmanVersion) {
      bundleVersion = <Version title='Podman version' version={this.state.podmanVersion} />
    }

    return (
      <div className={styles.marginBox}>
        <Bullseye>
          <div className={styles.logo} />
        </Bullseye>
        <div className={styles.marginBox}>
          <Version title='Red Hat CodeReady Containers version' version={`${this.state.crcVersion}+${this.state.crcCommit}`} />
          {bundleVersion}
          <Version title='Tray version' version={this.state.appVersion} />

          <div className={styles.linksBox}>
            <span className={styles.alignLeft}>
              <Button variant="link" className={styles.docButton} icon={<ExternalLinkSquareAltIcon />} iconPosition="right" component="a" onClick={this.openDocumentation} target="_blank">
                Documentation
              </Button>
            </span>
            <span className={styles.alignRight}>
              <Button variant="link" className={styles.repoButton} icon={<GithubIcon />} iconPosition="left" component="a" onClick={this.openRepo} target="_blank">
                Tray Repository
              </Button>
            </span>
          </div>
        </div>
      </div>
    )
  }
}

function Version(props: { title: string; version?: string }): JSX.Element {
  return <div className={styles.clearBoth}>
    <span className={styles.alignLeft}>{props.title}</span>
    <span className={styles.alignRight}>{props.version}</span>
  </div>;
}
