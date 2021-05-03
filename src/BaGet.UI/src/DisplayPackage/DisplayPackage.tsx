import { Icon } from 'office-ui-fabric-react/lib/Icon';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import timeago from 'timeago.js';
import { coerce, eq, gt, SemVer } from 'semver';

import { config } from '../config';
import Dependencies from './Dependencies';
import { PackageType, InstallationInfo } from './InstallationInfo';
import LicenseInfo from './LicenseInfo';
import * as Registration from './Registration';
import SourceRepository from './SourceRepository';
import { Versions, IPackageVersion } from './Versions';

import './DisplayPackage.css';
import DefaultPackageIcon from "../default-package-icon-256x256.png";

interface IDisplayPackageProps {
  match: {
    params: {
      id: string;
      version?: string;
    }
  }
}

interface IPackage {
  id: string;
  hasReadme: boolean;
  description: string;
  readme: string;
  lastUpdate: Date;
  iconUrl: string;
  projectUrl: string;
  licenseUrl: string;
  downloadUrl: string;
  repositoryUrl: string;
  repositoryType?: string;
  releaseNotes: string;
  totalDownloads: number;
  packageType: PackageType;
  downloads: number;
  authors: string;
  tags: string[];
  version: string;
  normalizedVersion: string;
  versions: IPackageVersion[];
  dependencyGroups: Registration.IDependencyGroup[];
}

interface IDisplayPackageState {
  loading: boolean;
  package?: IPackage;
}

class DisplayPackage extends React.Component<IDisplayPackageProps, IDisplayPackageState> {

  private static readonly initialState: IDisplayPackageState = {
    loading: true,
    package: undefined,
  };

  private id: string;
  private version: SemVer | null;

  private registrationController: AbortController;
  private readmeController: AbortController;

  constructor(props: IDisplayPackageProps) {
    super(props);

    this.registrationController = new AbortController();
    this.readmeController = new AbortController();

    this.id = props.match.params.id.toLowerCase();
    this.version = coerce(props.match.params.version);
    this.state = DisplayPackage.initialState;
  }

  public componentWillUnmount() {
    this.registrationController.abort();
    this.readmeController.abort();
  }

  public componentDidUpdate(previous: IDisplayPackageProps) {
    // This is used to switch between versions of the same package.
    if (previous.match.params.id !== this.props.match.params.id ||
      previous.match.params.version !== this.props.match.params.version) {
      this.registrationController.abort();
      this.readmeController.abort();

      this.registrationController = new AbortController();
      this.readmeController = new AbortController();

      this.id = this.props.match.params.id.toLowerCase();
      this.version = coerce(this.props.match.params.version);
      this.setState(DisplayPackage.initialState);
      this.componentDidMount();
    }
  }

  public componentDidMount() {
    const url = `${config.getNuGetServiceUrl()}/v3/registrations2/${this.id}/index.json`;

    fetch(url, {signal: this.registrationController.signal}).then(response => {
      return (response.ok) ? response.json() : null;
    }).then(json => {
      if (!json) {
        this.setState(prevState => {
          return { ...prevState, loading: false };
        });

        return;
      }

      const results = json as Registration.IRegistrationIndex;

      let currentItem: Registration.IRegistrationPageItem | undefined;
      let lastUpdate: Date | undefined;

      const anyListed = this.anyListed(results);
      const latestVersion = this.latestVersion(results, anyListed);
      const versions: IPackageVersion[] = [];

      for (const entry of results.items[0].items) {
        if (anyListed && !entry.catalogEntry.listed) {
          console.log('unlisted '.concat(entry.catalogEntry.version));
        }

        const normalizedVersion = this.normalizeVersion(entry.catalogEntry.version);
        const coercedVersion = coerce(entry.catalogEntry.version);

        if (coercedVersion === null) continue;

        const isCurrent = latestVersion !== null && coercedVersion !== null
          ? eq(coercedVersion, !!this.version ? this.version : latestVersion)
          : false;

        versions.push({
          date: new Date(entry.catalogEntry.published),
          downloads: entry.catalogEntry.downloads,
          version: normalizedVersion,
          selected: isCurrent,
          listed: entry.catalogEntry.listed,
        });

        if (isCurrent) {
          currentItem = entry;
        }

        const published = new Date(entry.catalogEntry.published);
        if (!lastUpdate || lastUpdate < published) {
          lastUpdate = published;
        }
      }

      if (latestVersion && currentItem && lastUpdate) {
        let readme = "";

        const isDotnetTool = (currentItem.catalogEntry.packageTypes &&
          currentItem.catalogEntry.packageTypes.indexOf("DotnetTool") !== -1);
        const isDotnetTemplate = (currentItem.catalogEntry.packageTypes &&
            currentItem.catalogEntry.packageTypes.indexOf("Template") !== -1);
        const packageType = isDotnetTool
          ? PackageType.DotnetTool
          : isDotnetTemplate
            ? PackageType.DotnetTemplate
            : PackageType.Dependency;

        this.setState({
          loading: false,
          package: {
            ...currentItem.catalogEntry,
            downloadUrl: currentItem.packageContent,
            packageType,
            lastUpdate,
            normalizedVersion: this.normalizeVersion(currentItem.catalogEntry.version),
            readme,
            totalDownloads: results.totalDownloads,
            versions
          }
        });

        if (currentItem.catalogEntry.hasReadme) {
          const readmeUrl = `${config.getNuGetServiceUrl()}/v3/flat2/${this.id}/${currentItem.catalogEntry.version}/readme`;

          fetch(readmeUrl, {signal: this.readmeController.signal}).then(response => {
            return response.text();
          }).then(result => {
            this.setState(prevState => {
              const state = {...prevState};

              state.package!.readme = result;

              return state;
            });
          });
        }
      }
    // tslint:disable-next-line:no-console
    }).catch((e) => console.log("Failed to load package.", e));
  }

  public render() {
    if (this.state.loading) {
      return (
        <div>...</div>
      );
    } else if (!this.state.package) {
      return (
        <div>
          <h2>Oops, package not found...</h2>
          <p>Could not find package '{this.id}'.</p>
          <p>You can try searching on <a href={`https://www.nuget.org/packages?q=${this.id}`} target="_blank" rel="noopener noreferrer">nuget.org</a> package.</p>
        </div>
      );
    } else {
      return (
        <div className="row display-package page-bottom-4em">
          <aside className="col-sm-1 package-icon hidden-xs">
            <img
              src={DefaultPackageIcon}
              className="img-responsive"
              alt="The package icon" />
          </aside>
          <article className="col-sm-8 package-details-main">
            <div className="package-title">
              <h1>
                {this.state.package.id}
                <small className="text-nowrap">{this.state.package.version}</small>
              </h1>
            </div>

            <InstallationInfo
              id={this.state.package.id}
              version={this.state.package.normalizedVersion}
              packageType={this.state.package.packageType} />

            {(() => {
              if (this.state.package.hasReadme) {
                return (
                  <ExpandableSection title="Documentation" expanded={true}>
                    <ReactMarkdown source={this.state.package.readme} />
                  </ExpandableSection>
                );
              } else {
                return (
                  <div className="package-description">
                    {this.state.package.description}
                  </div>
                );
              }
            })()}

            {this.state.package.releaseNotes &&
              <ExpandableSection title="Release Notes" expanded={false}>
                <div className="package-release-notes" >{this.state.package.releaseNotes}</div>
              </ExpandableSection>
            }

            <ExpandableSection title="Dependencies" expanded={false}>
              <Dependencies dependencyGroups={this.state.package.dependencyGroups} />
            </ExpandableSection>

            <ExpandableSection title="Versions" expanded={true}>
              <Versions packageId={this.id} versions={this.state.package.versions} />
            </ExpandableSection>
          </article>
          <aside className="col-sm-3 package-details-info">
            <div>
              <h2>Info</h2>

              <ul className="list-unstyled ms-Icon-ul">
                <li>
                  <Icon iconName="History" className="ms-Icon" />
                  Last updated {timeago().format(this.state.package.lastUpdate)}
                </li>
                {this.state.package.projectUrl &&
                  <li>
                    <Icon iconName="Globe" className="ms-Icon" />
                    <a href={this.state.package.projectUrl}>{this.state.package.projectUrl}</a>
                  </li>
                }
                <SourceRepository url={this.state.package.repositoryUrl} type={this.state.package.repositoryType} />
                <LicenseInfo url={this.state.package.licenseUrl} />
                <li>
                  <Icon iconName="CloudDownload" className="ms-Icon" />
                  <a href={this.state.package.downloadUrl}>Download package</a>
                </li>
              </ul>
            </div>

            <div>
              <h2>Statistics</h2>

              <ul className="list-unstyled ms-Icon-ul">
                <li>
                  <Icon iconName="Download" className="ms-Icon" />
                  {this.state.package.totalDownloads || 'N/A'} total downloads
                </li>
                <li>
                  <Icon iconName="GiftBox" className="ms-Icon" />
                  {this.state.package.downloads || 'N/A'} downloads of latest version
                </li>
              </ul>
            </div>

            {this.state.package.authors &&
            <div>
              <h2>Authors</h2>

              <ul className="list-unstyled ms-Icon-ul">
                {this.state.package.authors.split(',').map((author) => (
                <li>
                  <Icon iconName="Contact" className="ms-Icon" />
                  {author}
                </li>
                ))}
              </ul>
            </div>
            }
          </aside>
        </div>
      );
    }
  }

  private loadDefaultIcon = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DefaultPackageIcon;
  }

  private normalizeVersion(version: string): string {
    const buildMetadataStart = version.indexOf('+');
    return buildMetadataStart === -1
      ? version
      : version.substring(0, buildMetadataStart);
  }

  private anyListed(index: Registration.IRegistrationIndex): boolean {
    for (const entry of index.items[0].items) {
      if (entry.catalogEntry.listed) return true;
    }

    return false;
  }

  private latestVersion(index: Registration.IRegistrationIndex, shouldListed: boolean): SemVer | null {
    let latestVersion: SemVer | null = null;
    for (const entry of index.items[0].items) {
      if (shouldListed && !entry.catalogEntry.listed) continue;

      let entryVersion = coerce(entry.catalogEntry.version);
      if (!!entryVersion) {
        if (latestVersion === null || gt(entryVersion, latestVersion)) {
          latestVersion = entryVersion;
        }
      }
    }

    return latestVersion;
  }
}

interface IExpandableSectionProps {
  title: string;
  expanded: boolean;
}

interface IExpandableSectionState {
  expanded: boolean;
}

class ExpandableSection extends React.Component<IExpandableSectionProps, IExpandableSectionState> {
  constructor(props: IExpandableSectionProps) {
    super(props);

    this.state = { ...props };
  }

  public render() {
    if (this.state.expanded) {
      return (
        <div className="expandable-section">
          <h2>
            <button type="button" onClick={this.collapse} className="link-button">
              <Icon iconName="ChevronDown" className="ms-Icon" />
              <span>{this.props.title}</span>
            </button>
          </h2>

          {this.props.children}
        </div>
      );
    } else {
      return (
        <div className="expandable-section">
          <h2>
            <button type="button" onClick={this.expand} className="link-button">
              <Icon iconName="ChevronRight" className="ms-Icon" />
              <span>{this.props.title}</span>
            </button>
          </h2>
        </div>
      );
    }
  }

  private collapse = () => this.setState({expanded: false});
  private expand = () => this.setState({expanded: true});
}

export default DisplayPackage;
