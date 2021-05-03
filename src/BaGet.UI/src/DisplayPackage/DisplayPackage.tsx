import { Icon } from 'office-ui-fabric-react/lib/Icon';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import timeago from 'timeago.js';
import { coerce, eq, gt, SemVer } from 'semver';

import { config, QueryHierarchy } from '../config';
import Dependencies from './Dependencies';
import { PackageType, InstallationInfo } from './InstallationInfo';
import LicenseInfo from './LicenseInfo';
import * as Registration from './Registration';
import SourceRepository from './SourceRepository';
import { Versions, IPackageVersion } from './Versions';

import './DisplayPackage.css';
import DefaultPackageIcon from "../default-package-icon-256x256.png";
import { HierarchyResult, VersionMetric } from './HierarchyResult';
import { CountedResult, TinyPackageVersion } from '../AzureDevOps';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';

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
  private guid: string;
  private version: SemVer | null;

  private registrationController: AbortController;
  private versionController: AbortController;

  constructor(props: IDisplayPackageProps) {
    super(props);

    this.registrationController = new AbortController();
    this.versionController = new AbortController();

    this.id = props.match.params.id.toLowerCase();
    this.version = coerce(props.match.params.version);
    this.state = DisplayPackage.initialState;
  }

  public componentWillUnmount() {
    this.registrationController.abort();
    this.versionController.abort();
  }

  public componentDidUpdate(previous: IDisplayPackageProps) {
    // This is used to switch between versions of the same package.
    if (previous.match.params.id !== this.props.match.params.id ||
      previous.match.params.version !== this.props.match.params.version) {
      this.registrationController.abort();
      this.versionController.abort();

      this.registrationController = new AbortController();
      this.versionController = new AbortController();

      this.id = this.props.match.params.id.toLowerCase();
      this.version = coerce(this.props.match.params.version);
      this.setState(DisplayPackage.initialState);
      this.componentDidMount();
    }
  }

  private createPost(signal: AbortSignal, body: object) : RequestInit {
    return {
      signal: signal,
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(body),

      headers: (() => {
        let header = new Headers();
        header.append('Accept', 'application/json;api-version=5.0-preview.1;excludeUrls=true;enumsAsNumbers=true;msDateFormat=true;noArrayWrap=true');
        header.append('Content-Type', 'application/json');
        return header;
      })(),
    };
  }

  public componentDidMount() {
    const options = this.createPost(
      this.registrationController.signal,
      QueryHierarchy((() => {
        const options = {
          _a: "package",
          feed: config.feedName,
          package: this.id,
          protocolType: "NuGet",
          view: "versions",
        };
        if (this.version !== null) {
          options['version'] = this.version.raw;
        }
        return options;
      })()));

    fetch(config.getHierarchyQueryUrl(), options).then(response => {
      return (response.ok) ? response.json() : null;
    }).then(json => {
      const hierarchyResult = json as HierarchyResult;
      const packageAll = hierarchyResult.dataProviders['ms.feed.package-hub-data-provider'].packageDetailsResult;
      if (packageAll.package === null || packageAll.packageVersion === null) {
        console.log('package version not found.');
        return null;
      }

      const packageVersionIds : string[] = [];
      const version = packageAll.packageVersion;
      const anyListed = this.anyListed(packageAll.package.versions);
      const latestVersion = this.latestVersion(packageAll.package.versions, anyListed);
      const versions: IPackageVersion[] = [];
      const idMaps = new Map<string, IPackageVersion>();
      const dependencies: Registration.IDependencyGroup[] = [];

      for (const entry of packageAll.package.versions) {
        if (anyListed && !entry.isListed) {
          console.log('unlisted '.concat(entry.version));
        }

        const normalizedVersion = entry.normalizedVersion;
        const coercedVersion = coerce(entry.version);

        if (coercedVersion === null) continue;

        const isCurrent = latestVersion !== null && coercedVersion !== null
          ? eq(coercedVersion, !!this.version ? this.version : latestVersion)
          : false;

        const ver : IPackageVersion = {
          date: undefined,
          downloads: 0,
          version: normalizedVersion,
          selected: isCurrent,
          listed: entry.isListed,
          id: entry.id,
          latest: entry.isLatest,
        };

        versions.push(ver);
        if (entry.id) {
          packageVersionIds.push(entry.id);
          idMaps.set(entry.id, ver);
        }
      }

      for (const entry of version.dependencies) {
        let group : Registration.IDependencyGroup | undefined;
        for (const groupEntry of dependencies) {
          if (groupEntry.targetFramework === entry.group) {
            group = groupEntry;
            break;
          }
        }

        if (group === undefined) {
          dependencies.push(group = {
            targetFramework: entry.group,
            dependencies: [],
          });
        }

        group.dependencies.push({
          id: entry.packageName,
          range: entry.versionRange,
        });
      }

      const curState : IDisplayPackageState = {
        loading: false,
        package: {
          id: version.protocolMetadata.data.title,
          lastUpdate: this.normalizeDate(version.publishDate),
          description: version.description,
          projectUrl: version.protocolMetadata.data.projectUrl,
          licenseUrl: version.protocolMetadata.data.licenseUrl,
          downloadUrl: `${config.getNuGetServiceUrl()}/v3/flat2/${packageAll.package.normalizedName}/${version.version}/${packageAll.package.normalizedName}.${version.version}.nupkg`,
          dependencyGroups: dependencies,
          authors: version.author,
          tags: version.tags,
          version: version.version,
          normalizedVersion: version.normalizedVersion,
          versions: versions,
          hasReadme: false,
          readme: "",
          downloads: undefined,
          totalDownloads: undefined,
          iconUrl: "",
          releaseNotes: "",
          packageType: 0,
          repositoryUrl: "",
        },
      };

      this.guid = packageAll.package.id;

      const url = `https://feeds.dev.azure.com/${config.organizationId}/${config.projectId}/_apis/Packaging/Feeds/${config.feedId}/Packages/${this.guid}/VersionMetricsBatch`;
      const options = this.createPost(this.versionController.signal, { packageVersionIds });
      fetch(url, options).then(response => {
        return (response.ok) ? response.json() : null;
      }).then(json => {
        const result = json as VersionMetric[];
        let latestDownload = 0;
        let totalDownload = 0;
        for (const entry of result) {
          var ver = idMaps.get(entry.packageVersionId);
          ver.downloads = entry.downloadCount;
          if (ver.latest) latestDownload = entry.downloadCount;
          totalDownload += entry.downloadCount;
        }

        const url2 = `https://feeds.dev.azure.com/${config.organizationId}/${config.projectId}/_apis/Packaging/Feeds/${config.feedId}/Packages/${this.guid}/Versions`;
        fetch(url2, { signal: this.versionController.signal }).then(response => {
          return (response.ok) ? response.json() : null;
        }).then(json => {
          const result = json as CountedResult<TinyPackageVersion>;
          for (const entry of result.value) {
            var ver = idMaps.get(entry.id);
            ver && (ver.date = this.normalizeDate(entry.publishDate));
          }

          curState.package.totalDownloads = totalDownload;
          curState.package.downloads = latestDownload;
          this.setState(curState);
        });
      });
    });
  }

  public render() {
    if (this.state.loading) {
      return (
        <div className="dy-5 main-container">
          <Spinner size={SpinnerSize.large} label="Loading package information..." />
        </div>
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

            <ExpandableSection title="Dependencies" expanded={true}>
              <Dependencies dependencyGroups={this.state.package.dependencyGroups} />
            </ExpandableSection>

            <ExpandableSection title="Versions" expanded={true}>
              {this.state.package.versions === undefined
              ? <Spinner className="put-left" label="Still loading..." ariaLive="assertive" labelPosition="right" />
              : <Versions packageId={this.id} versions={this.state.package.versions} />}
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

  private normalizeDate(original: string) : Date {
    if (original === undefined) {
      return undefined;
    } else if (original.startsWith('/Date(')) {
      return new Date(parseInt(original.substr(6, 13)));
    } else {
      return new Date(original);
    }
  }

  private normalizeVersion(version: string): string {
    const buildMetadataStart = version.indexOf('+');
    return buildMetadataStart === -1
      ? version
      : version.substring(0, buildMetadataStart);
  }

  private anyListed(index: TinyPackageVersion[]): boolean {
    for (const entry of index) {
      if (entry.isListed) return true;
    }
    return false;
  }

  private latestVersion(index: TinyPackageVersion[], shouldListed: boolean): SemVer | null {
    let latestVersion: SemVer | null = null;
    for (const entry of index) {
      if (shouldListed && !entry.isListed) continue;

      let entryVersion = coerce(entry.version);
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
