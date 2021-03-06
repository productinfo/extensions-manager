import React from 'react';
import Repo from "../models/Repo.js";
import RepoView from "./RepoView.js";
import BridgeManager from "../lib/BridgeManager.js";
import InstallRepo from "./InstallRepo";
import Advanced from "./Advanced";
import ManageInstalled from "./ManageInstalled";

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    this.repoRefs = [];
    this.state = {repos: []};

    BridgeManager.get().initiateBridge(() => {
      this.setState({ready: true});
      this.reload();
    });

    BridgeManager.get().addEventHandler((event, data) => {
      if(event == BridgeManager.EventDownloadingPackages) {
        this.setState({downloading: true});
      } else if(event == BridgeManager.EventDoneDownloadingPackages) {
        setTimeout(() => {
          this.setState({downloading: false});
        }, 300);
      } else if(event == BridgeManager.EventUpdatedValidUntil) {
        this.setState({validUntil: data.valid_until});
      }
    })

    BridgeManager.get().addUpdateObserver(() => {
      this.reload();
    })
  }

  reload() {
    var repos = BridgeManager.get().installedRepos;
    this.setState({repos: repos});

    if(repos.length > 0 && !BridgeManager.get().didBeginStreaming()) {
      BridgeManager.get().beginStreamingItems();
    }
  }

  refreshValidUntil = () => {
    for(var ref of this.repoRefs) {
      ref.refreshRepo();
    }
  }

  addRepoRef = (ref) => {
    if(ref && !this.repoRefs.includes(ref)) {
      this.repoRefs.push(ref);
    }
  }

  isExpired = () => {
    return !this.state.validUntil || this.state.validUntil < new Date();
  }

  render() {
    return (
      <div id="home" className="panel static">
        <div className="content">
          {this.state.ready && this.state.repos.length == 0 &&
            <InstallRepo />
          }
          {this.state.downloading &&
            <div>
              <div className="panel-row justify-left horizontal-group">
                <div className="spinner info small"></div>
                <h4>Refreshing packages...</h4>
                <hr/>
              </div>
              <div className="panel-row"/>
            </div>
          }

          {!this.state.downloading && this.state.validUntil &&
            <div>
              <div className="panel-row justify-left horizontal-group">
                <div className={"circle small " + (this.isExpired() ? "danger" : "success")} />
                <p>Your Extended benefits {this.isExpired() ? "expired on" : "are valid until"} {this.state.validUntil.toLocaleString()}</p>
                <a className="info" onClick={this.refreshValidUntil}> Refresh </a>
                <hr/>
              </div>
              <div className="panel-row"/>
            </div>
          }

          <ManageInstalled />

          {this.state.repos.map((repo, index) =>
            <RepoView key={index} repo={repo} ref={(ref) => {this.addRepoRef(ref)}} />
          )}
        </div>

        <div className="footer">
          <div className="right">
            <Advanced />
          </div>
        </div>
      </div>
    )
  }

}
