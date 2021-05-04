let config = {
  apiUrl: "__BAGET_PLACEHOLDER_API_URL__",
  organizationId: "tlylz",
  projectId: "5f8d36de-7004-4c36-a8b5-8a4bda9eb598",
  projectName: "namomo",
  feedId: "c2949ad7-bda3-4f23-a41b-3109c9419cb7",
  feedName: "namofun",
  getNuGetServiceUrl: (): string => `https://pkgs.dev.azure.com/${config.organizationId}/${config.projectId}/_packaging/${config.feedId}/nuget`,
  getHierarchyQueryUrl: (): string => `https://feeds.dev.azure.com/${config.organizationId}/_apis/Contribution/HierarchyQuery/project/${config.projectId}`,
  getAdoRestfulUrl: (): string => `https://feeds.dev.azure.com/${config.organizationId}/${config.projectId}/_apis/Packaging/Feeds/${config.feedId}/Packages`,
  getMetricUrl: (): string => `https://feeds.dev.azure.com/${config.organizationId}/${config.projectId}/_apis/Packaging/Feeds/${config.feedId}/PackageMetricsBatch`,
  reverseVersionArray: false
};

// When runing `npm test` react-script automaticaly set this env variable
//   so we can test fetch request. (node fetch requires a full URL)
if (process.env.NODE_ENV === 'test' && config.apiUrl.startsWith("__BAGET_PLACEHOLDER_")) {
  config.apiUrl = 'http://localhost';
}

if (config.apiUrl.startsWith("__BAGET_PLACEHOLDER_")) {
  config.apiUrl = "";
}

if (config.apiUrl.endsWith('/')) {
  config.apiUrl = config.apiUrl.slice(0, -1);
}

interface ContributionHierarchyQuery {
  contributionIds: string[],
  dataProviderContext: {
    properties: {
      sourcePage: {
        url: string,
        routeId: string,
        routeValues: object,
      }
    }
  }
}

function QueryHierarchy(parameters: object) : ContributionHierarchyQuery {
  const queryString = Object.keys(parameters)
    .map(k => `${k}=${encodeURIComponent(parameters[k])}`)
    .join('&');

  return {
    contributionIds: [
      "ms.feed.package-hub-data-provider"
    ],
    dataProviderContext: {
      properties: {
        sourcePage: {
          url: `https://dev.azure.com/tlylz/namomo/_packaging?${queryString}`,
          routeId: "ms.feed.packaging-hub-route",
          routeValues: {
            project: config.projectName,
            controller: "ContributedPage",
            action: "Execute",
          }
        }
      }
    }
  }
}

export { config, ContributionHierarchyQuery, QueryHierarchy };
