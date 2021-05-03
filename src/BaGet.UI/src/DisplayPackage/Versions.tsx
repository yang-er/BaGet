import * as React from 'react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'react-router-dom';

import './Versions.css';
import { config } from '../config';
import { Spinner } from 'office-ui-fabric-react';

export interface IPackageVersion {
  version: string;
  downloads: number;
  date: Date;
  selected: boolean;
  listed: boolean;
  latest: boolean;
  id?: string;
}

interface IVersionsProps {
  packageId: string;
  versions: IPackageVersion[];
}

interface IVersionsState {
  showAll: boolean;
}

export class Versions extends React.Component<IVersionsProps, IVersionsState> {
  private static readonly defaultVisible = 5;

  constructor(props: IVersionsProps) {
    super(props);

    this.state = { showAll: false };
  }

  public render() {
    // Show the versions from greatest to smallest.
    // We clone the versions array to avoid modifying the props.
    // This assumes the versions are ordered by semver ascendingly.
    let versionsToRender = [...this.props.versions];

    if (config.reverseVersionArray) {
      versionsToRender.reverse();
    }

    if (!this.state.showAll) {
      versionsToRender = versionsToRender.slice(0, Versions.defaultVisible);
    }

    return (
      <div className="version-list">
        <table className="table borderless">
          <thead>
            <tr>
              <th>Version</th>
              <th>Downloads</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody className="no-border">
            {versionsToRender.map(this.renderVersion)}
          </tbody>
        </table>

        {this.renderShowAllOrLessButton()}
      </div>
    );
  }

  private renderVersion = (packageVersion: IPackageVersion) => {
    const className1 = packageVersion.selected
      ? "bg-info"
      : "";

    const className2 = packageVersion.listed
      ? ""
      : "unlisted";

    const className = className1.concat(' ').concat(className2).trim();

    return (
      <tr key={packageVersion.version} className={className}>
        <td><Link to={`/packages/${this.props.packageId}/${packageVersion.version}`}>{packageVersion.version}</Link></td>
        <td>{packageVersion.downloads === undefined ? <Spinner className="put-left" /> : packageVersion.downloads.toLocaleString()}</td>
        <td>{this.dateToString(packageVersion.date) || <Spinner className="put-left" />}</td>
      </tr>
    );
  }

  private renderShowAllOrLessButton = () => {
    if (this.props.versions.length <= Versions.defaultVisible) {
      return null;
    }

    if (this.state.showAll) {
      return (
        <button type="button" onClick={this.showFewerVersions} className="link-button">
          <Icon iconName="CalculatorSubtract" className="ms-Icon" />
          <span>Show less</span>
        </button>
      );
    } else {
      return (
        <button type="button" onClick={this.showAllVersions} className="link-button">
          <Icon iconName="CalculatorAddition" className="ms-Icon" />
          <span>Show more</span>
        </button>
      );
    }
  }

  private showAllVersions = () => this.setState({ showAll: true });
  private showFewerVersions = () => this.setState({ showAll: false });

  private dateToString(date: Date): string {
    if (date === undefined) {
      return undefined;
    } else {
      return date.toLocaleDateString();
    }
  }
}
