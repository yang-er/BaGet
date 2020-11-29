import { config } from './config';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Checkbox, Dropdown, IDropdownOption, SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/index';
import * as React from 'react';
import { Link } from 'react-router-dom';
import './SearchResults.css';
import DefaultPackageIcon from "./default-package-icon-256x256.png";

const defaultSearchTake = 100;

interface ISearchResultsProps {
  input: string;
}

interface IPackage {
  id: string;
  authors: string[];
  totalDownloads: number;
  version: string;
  tags: string[];
  description: string;
  iconUrl: string;
}

interface ISearchResultsState {
  includePrerelease: boolean;
  packageType: string;
  targetFramework: string;
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
      packageType: 'any',
      targetFramework: 'any',
      page: 1,
      items: [],
      loading: false
    };
  }

  public componentDidMount() {
    this.loadItems(
      this.props.input,
      this.state.includePrerelease,
      this.state.packageType,
      this.state.targetFramework);
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
      this.state.includePrerelease,
      this.state.packageType,
      this.state.targetFramework);
  }

  public render() {
    let noResultsFound = !this.state.loading && this.state.items.length === 0;
    let showLoadMore = !this.state.loading &&
      this.state.items.length === this.state.page * defaultSearchTake;

    return (
      <div className="page-bottom-4rem">
        <form className="search-options form-inline">
          <div className="form-group">
            <label>Package Type:</label>

            <div className="search-dropdown">
              <Dropdown
                defaultSelectedKey={this.state.packageType}
                dropdownWidth={200}
                onChange={this.onChangePackageType}
                options={[
                  {key: 'any', text: 'Any'},
                  {key: 'dependency', text: 'Dependency'},
                  {key: 'dotnettool', text: '.NET Tool'},
                  {key: 'template', text: '.NET Template'},
                ]}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Framework:</label>

            <div className="search-dropdown">
              <Dropdown
                defaultSelectedKey={this.state.targetFramework}
                dropdownWidth={200}
                onChange={this.onChangeFramework}
                options={[
                  { key: 'any', text: 'Any' },

                  { key: 'divider1', text: '-', itemType: SelectableOptionMenuItemType.Divider },
                  { key: 'header1', text: '.NET', itemType: SelectableOptionMenuItemType.Header },

                  { key: 'net5.0', text: '.NET 5.0' },

                  { key: 'divider2', text: '-', itemType: SelectableOptionMenuItemType.Divider },
                  { key: 'header2', text: '.NET Standard', itemType: SelectableOptionMenuItemType.Header },

                  { key: 'netstandard2.1', text: '.NET Standard 2.1' },
                  { key: 'netstandard2.0', text: '.NET Standard 2.0' },
                  { key: 'netstandard1.6', text: '.NET Standard 1.6' },

                  { key: 'divider3', text: '-', itemType: SelectableOptionMenuItemType.Divider },
                  { key: 'header3', text: '.NET Core', itemType: SelectableOptionMenuItemType.Header },

                  { key: 'netcoreapp3.1', text: '.NET Core 3.1' },
                  { key: 'netcoreapp2.2', text: '.NET Core 2.2' },
                  { key: 'netcoreapp2.1', text: '.NET Core 2.1' },

                  { key: 'divider4', text: '-', itemType: SelectableOptionMenuItemType.Divider },
                  { key: 'header4', text: '.NET Framework', itemType: SelectableOptionMenuItemType.Header },

                  { key: 'net48', text: '.NET Framework 4.8' },
                  { key: 'net472', text: '.NET Framework 4.7.2' },
                ]}
                />
              </div>
          </div>
          <div className="form-group">
            <Checkbox
              defaultChecked={this.state.includePrerelease}
              onChange={this.onChangePrerelease}
              label="Include prerelease:"
              boxSide="end"
            />
          </div>
        </form>

        {(() => {
          if (noResultsFound) {
            return (
              <div>
                <h2>Oops, nothing here...</h2>
                <p>
                  It looks like there's no package here to see. Take a look below for useful links.
                </p>
                <p><Link to="/upload">Upload a package</Link></p>
                <p><a href="https://loic-sharma.github.io/BaGet/" target="_blank" rel="noopener noreferrer">BaGet documentation</a></p>
                <p><a href="https://github.com/loic-sharma/BaGet/issues" target="_blank" rel="noopener noreferrer">BaGet issues</a></p>
              </div>
            );
          } else {
            return this.state.items.map(value => (
              <div key={value.id} className="row search-result">
                <div className="col-sm-1 hidden-xs hidden-sm">
                  <img
                    src={DefaultPackageIcon}
                    className="package-icon img-responsive"
                    onError={this.loadDefaultIcon}
                    alt="The package icon" />
                </div>
                <div className="col-sm-11">
                  <div>
                    <Link to={`/packages/${value.id}`} className="package-title">{value.id}</Link>
                    <span>by: {value.authors.join(', ')}</span>
                  </div>
                  <ul className="info">
                    <li>
                      <span>
                        <Icon iconName="Download" className="ms-Icon" />
                        {value.totalDownloads.toLocaleString()} total downloads
                      </span>
                    </li>
                    <li>
                      <span>
                        <Icon iconName="Flag" className="ms-Icon" />
                        Latest version: {value.version}
                      </span>
                    </li>
                    {value.tags.length > 0 &&
                      <li>
                        <span className="tags">
                          <Icon iconName="Tag" className="ms-Icon" />
                          {value.tags.join(' ')}
                        </span>
                      </li>
                    }
                  </ul>
                  <div>
                    {value.description}
                  </div>
                </div>
              </div>
            ));
          }
        })()}

        {showLoadMore &&
          <div className="row text-center">
            <div className="col-sm-12">
              <h3>
                <button type="button" onClick={this.loadMore} className="link-button">
                  <span>Load more...</span>
                </button>
              </h3>
            </div>
          </div>
        }

      </div>
    );
  }

  private loadItems(
    query: string,
    includePrerelease: boolean,
    packageType: string,
    targetFramework: string
  ): void {
    const url = this.buildUrl(
      query,
      0,
      includePrerelease,
      packageType,
      targetFramework
    );

    let resetItems = () =>
      this.setState({
        page: 1,
        items: [],
        includePrerelease: includePrerelease,
        packageType: packageType,
        targetFramework: targetFramework,
        loading: true,
      });

    let setItems = (results: ISearchResponse) =>
      this.setState({
        page: 1,
        items: results.data,
        includePrerelease: includePrerelease,
        packageType: packageType,
        targetFramework: targetFramework,
        loading: false,
      });

    this.fetchSearchResults(url, resetItems, setItems);
  }

  private loadMoreItems(): void {
    const url = this.buildUrl(
      this.props.input,
      this.state.page * defaultSearchTake,
      this.state.includePrerelease,
      this.state.packageType,
      this.state.targetFramework);

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
        packageType: this.state.packageType,
        targetFramework: this.state.targetFramework,
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
      return response.ok
        ? response.json()
        : null;
    }).then(resultsJson => {
      if (!resultsJson) {
        return;
      }

      const results = resultsJson as ISearchResponse;

      onComplete(results);
    })
    .catch((e) => {
      var ex = e as DOMException;
      if (!ex || ex.code !== DOMException.ABORT_ERR) {
        console.log("Unexpected error on search", e);
      }
    });
  }

  private buildUrl(
    query: string,
    skip: number,
    includePrerelease: boolean,
    packageType?: string,
    targetFramework?: string
  ): string {
    const parameters: { [parameter: string]: string } = {
      semVerLevel: "2.0.0",
      take: defaultSearchTake.toString()
    };

    if (query && query.length !== 0) {
      parameters.q = query;
    }

    if (skip !== 0) {
      parameters.skip = skip.toString();
    }

    if (includePrerelease) {
      parameters.prerelease = 'true';
    }

    if (packageType && packageType !== 'any') {
      parameters.packageType = packageType;
    }

    if (targetFramework && targetFramework !== 'any') {
      parameters.framework = targetFramework;
    }

    const queryString = Object.keys(parameters)
      .map(k => `${k}=${encodeURIComponent(parameters[k])}`)
      .join('&');

    return `${config.apiUrl}/v3/search?${queryString}`;
  }

  private loadDefaultIcon = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DefaultPackageIcon;
  }

  private onChangePackageType = (e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) : void => {
    this.loadItems(
      this.props.input,
      this.state.includePrerelease,
      (option) ? option.key.toString() : 'any',
      this.state.targetFramework);
  }

  private onChangeFramework = (e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) : void => {
    this.loadItems(
      this.props.input,
      this.state.includePrerelease,
      this.state.packageType,
      option!.key.toString());
  }

  private onChangePrerelease = () : void => {
    this.loadItems(
      this.props.input,
      !this.state.includePrerelease,
      this.state.packageType,
      this.state.targetFramework);
  }

  private loadMore = () : void => this.loadMoreItems();
}

export default SearchResults;
