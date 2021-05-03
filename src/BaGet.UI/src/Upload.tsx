import * as React from 'react';

import './Upload.css';

class Upload extends React.Component<{}, {}> {

  private baseUrl: string;
  private serviceIndexUrl: string;
  private preUrl: string;
  private postUrl: string;

  constructor(props: {}) {
    super(props);

    const pathEnd = window.location.href.indexOf("/connect");

    this.baseUrl = window.location.href.substring(0, pathEnd);
    this.serviceIndexUrl = this.baseUrl + "/v3/index.json";

    this.preUrl = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="namofun" value="`;
    this.postUrl = `" />
  </packageSources>
</configuration>`;
    this.state = {};
  }

  public render() {
    return (
      <div className="col-sm-12">
        <h1>Connect to feed</h1>
        <p>Add a <code>nuget.config</code> file to your project, in the same folder as your <code>.csproj</code> or <code>.sln</code> file.</p>
        <pre className="mb-24px">{this.preUrl}{this.serviceIndexUrl}{this.postUrl}</pre>
        <p>Then restore packages via <code>dotnet restore</code>.</p>
      </div>
    );
  }
}

export default Upload;
