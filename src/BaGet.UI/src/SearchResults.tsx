import { config } from './config';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Checkbox, Dropdown, IDropdownOption, SelectableOptionMenuItemType, Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/index';
import * as React from 'react';
import { Link } from 'react-router-dom';
import './SearchResults.css';
import DefaultPackageIcon from "./default-package-icon-256x256.png";
import timeago from 'timeago.js';

const defaultSearchTake = 100;

interface ISearchResultsProps {
  input: string;
}

interface IPackage {
  id: string;
  totalDownloads: number;
  version: string;
  publishDate: Date;
  description: string;
}

interface PackageMetric {
  packageId: string;
  downloadCount: number;
  downloadUniqueUsers: number;
}

interface ResultVersion {
  id: string;
  normalizedVersion: string;
  version: string;
  isLatest: boolean;
  isListed: boolean;
  packageDescription: string;
  publishDate: string;
}

interface ResultPackage {
  id: string;
  normalizedName: string;
  name: string;
  versions: ResultVersion[];
}

interface ISearchResultsState {
  includePrerelease: boolean;
  page: number;
  items: IPackage[];
  loading: boolean;
}

interface ISearchResponse {
  data: IPackage[];
}

class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {

  private resultsController?: AbortController;

  constructor(props: ISearchResultsProps) {
    super(props);

    this.state = {
      includePrerelease: true,
      page: 1,
      items: [],
      loading: false
    };
  }

  public componentDidMount() {
    this.loadItems(
      this.props.input,
      this.state.includePrerelease);
  }

  public componentWillUnmount() {
    if (this.resultsController) {
      this.resultsController.abort();
    }
  }

  public componentDidUpdate(prevProps: Readonly<ISearchResultsProps>) {
    if (prevProps.input === this.props.input) {
      return;
    }

    this.loadItems(
      this.props.input,
      this.state.includePrerelease);
  }

  public render() {
    return this.state.loading && this.state.items.length === 0 ? (
      <div className="dy-5 main-container">
        <Spinner size={SpinnerSize.large} label="Loading package information..." />
      </div>
    ) : (
      <div className="page-bottom-4rem">
        {(() => {
          if (!this.state.loading && this.state.items.length === 0) {
            return (
              <div>
                <h2>Oops, nothing here...</h2>
                <p>
                  It looks like there's no package here to see.
                </p>
              </div>
            );
          } else {
            return this.state.items.map(value => (
              <div key={value.id} className="row search-result">
                <div className="col-sm-1 hidden-xs hidden-sm">
                  <img
                    src={DefaultPackageIcon}
                    className="package-icon img-responsive"
                    alt="The package icon" />
                </div>
                <div className="col-sm-11">
                  <div>
                    <Link to={`/packages/${value.id}`} className="package-title">{value.id}</Link>
                  </div>
                  <ul className="info">
                    <li>
                      <span>
                        <Icon iconName="Download" className="ms-Icon" />
                        &nbsp;{value.totalDownloads === undefined ? 'N/A' : value.totalDownloads.toLocaleString()} total downloads
                      </span>
                    </li>
                    <li>
                      <span>
                        <Icon iconName="History" className="ms-Icon" />
                        &nbsp;last updated {timeago().format(value.publishDate)}
                      </span>
                    </li>
                    <li>
                      <span>
                        <Icon iconName="Flag" className="ms-Icon" />
                        &nbsp;Latest version: {value.version}
                      </span>
                    </li>
                  </ul>
                  <div>
                    {value.description}
                  </div>
                </div>
              </div>
            ));
          }
        })()}

        {this.state.items.length === this.state.page * defaultSearchTake &&
          <div className="row text-center">
            <div className="col-sm-12">
              <h3>
                {!this.state.loading
                  ? <button type="button" onClick={this.loadMore} className="link-button">
                      <span>Load more...</span>
                    </button>
                  : <Spinner size={SpinnerSize.large} label="Loading more..." labelPosition="right" />}
              </h3>
            </div>
          </div>
        }
      </div>
    );
  }

  private loadItems(
    query: string,
    includePrerelease: boolean
  ): void {
    const url = this.buildUrl(
      query,
      0,
      includePrerelease,
    );

    let resetItems = () =>
      this.setState({
        page: 1,
        items: [],
        includePrerelease: includePrerelease,
        loading: true,
      });

    let setItems = (results: ISearchResponse) =>
      this.setState({
        page: 1,
        items: results.data,
        includePrerelease: includePrerelease,
        loading: false,
      });

    this.fetchSearchResults(url, resetItems, setItems);
  }

  private loadMoreItems(): void {
    const url = this.buildUrl(
      this.props.input,
      this.state.page * defaultSearchTake,
      this.state.includePrerelease);

    let showLoading = () =>
      this.setState({
        ...this.state,
        loading: true
      });

    let addPage = (results: ISearchResponse) =>
      this.setState({
        page: this.state.page + 1,
        items: this.state.items.concat(results.data),
        includePrerelease: this.state.includePrerelease,
        loading: false
      });

    this.fetchSearchResults(
      url,
      showLoading,
      addPage);
  }

  private fetchSearchResults(
    url: string,
    onStart: () => void,
    onComplete: (results: ISearchResponse) => void
  ): void {
    if (this.resultsController) {
      this.resultsController.abort();
    }

    this.resultsController = new AbortController();

    onStart();

    fetch(url, {signal: this.resultsController.signal}).then(response => {
      return response.ok ? response.json() : null;
    }).then(resultsJson => {
      if (!resultsJson) return;

      const results = resultsJson as { value: ResultPackage[] };
      const response : ISearchResponse = { data: [] };
      const guidMap : { [parameter: string]: IPackage } = {};

      for (const entry of results.value) {
        const datum : IPackage = {
          description: entry.versions[0].packageDescription,
          id: entry.name,
          version: entry.versions[0].version,
          publishDate: this.normalizeDate(entry.versions[0].publishDate),
          totalDownloads: 0,
        };

        response.data.push(datum);
        guidMap[entry.id] = datum;
      }

      const metricQuery = this.createPost(this.resultsController.signal, {packageIds: Object.keys(guidMap)});
      fetch(config.getMetricUrl(), metricQuery).then(response => {
        return response.ok ? response.json() : null;
      }).then(resultsJson => {

        if (resultsJson) {
          const results = resultsJson as PackageMetric[];
          for (const entry of results) {
            guidMap[entry.packageId].totalDownloads = entry.downloadCount;
          }
        }

        onComplete(response);
      });
    })
    .catch((e) => {
      var ex = e as DOMException;
      if (!ex || ex.code !== DOMException.ABORT_ERR) {
        console.log("Unexpected error on search", e);
      }
    });
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

  private buildUrl(
    query: string,
    skip: number,
    includePrerelease: boolean
  ): string {
    const parameters: { [parameter: string]: string } = {
      includeDescription: 'true',
      $top: defaultSearchTake.toString(),
      includeDeleted: 'false',
      isListed: 'true',
      protocolType: 'NuGet',
      'api-version': '6.0-preview.1',
    };

    if (query && query.length !== 0) {
      parameters.packageNameQuery = query;
    }

    if (skip !== 0) {
      parameters.$skip = skip.toString();
    }

    if (!includePrerelease) {
      parameters.isRelease = 'true';
    }

    const queryString = Object.keys(parameters)
      .map(k => `${k}=${encodeURIComponent(parameters[k])}`)
      .join('&');

    return `${config.getAdoRestfulUrl()}?${queryString}`;
  }

  private loadMore = () : void => this.loadMoreItems();
}

export default SearchResults;
