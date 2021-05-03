import { PackageVersion, TinyPackageVersion } from "../AzureDevOps";

export interface HierarchyResult {
  dataProviders: {
    "ms.feed.package-hub-data-provider": {
      packageDetailsResult: {
        package: {
          id: string,
          normalizedName: string,
          name: string,
          protocolType: 'NuGet',
          versions: TinyPackageVersion[],
        },
        packageVersion: PackageVersion,
      }
    }
  }
}

export interface VersionMetric {
  packageId: string,
  packageVersionId: string,
  downloadCount: number,
}

/*
[{
  "packageId":"a1b74564-e1e0-4167-857d-4d55852c3fad",
  "packageVersionId":"5f674cae-f1f1-40ed-846c-7dcfe16c64f2",
  "downloadCount":3.0,
  "downloadUniqueUsers":1.0,
  "lastDownloaded":"\/Date(1619958962887+0000)\/"
}]
{
  "dataProviderSharedData":{
    "_featureFlags":{
      "Packaging.Feed.ConnectToFeed.EnableUI":true,
      "Packaging.Feed.GlobalPermissionsMapWellKnownIdentifier":true,
      "Packaging.Feed.WebAccess.IvyUI":false,
      "Packaging.Feed.FeedRecycleBin.EnableUI":true,
      "Packaging.Feed.DisableEmptyRecycleBin":true,
      "Packaging.Feed.NuGet.EmbeddedLicenseLink":false,
      "Packaging.Feed.UPackSameCollectionUpstreams":true,
      "Packaging.Feed.Upstreams.EnableOverrideUI":true
    }
  },
  "dataProviders":{
    "ms.feed.package-hub-data-provider":{
      "packagesResult":null,
      "packageDetailsResult":{
        "package":{
          "id":"8b284912-0abd-4e81-9397-451ea82e78cc",
          "normalizedName":"blogging.abstraction",
          "name":"Blogging.Abstraction",
          "protocolType":"NuGet",
          "versions":[
            {
              "id":"565d0e22-f630-4162-823b-08e38b3cd09f",
              "normalizedVersion":"1.1.12",
              "version":"1.1.12",
              "isLatest":true,
              "isListed":true,
              "storageId":"6986C63D79F179260D203240496FF0FBC944CDC2A645F78A6CDBC2E3F1B3CCAB00",
              "views":[
                {"id":"e3d1736a-e41b-439b-9f96-261821c485e4","name":"Release","url":null,"type":1},
                {"id":"434175c8-dbfc-4b58-8b8b-7dc8833756d0","name":"Local","url":null,"type":2}
              ]
            },
            {"id":"99670608-5c90-48f7-b702-5e64e7ab7d45","normalizedVersion":"1.0.11","version":"1.0.11","isLatest":false,"isListed":true,"storageId":"00D48FD335AF88C18DA12B97BC82617F532FEFA91D13DA54A0410B017E1689C000","views":[{"id":"434175c8-dbfc-4b58-8b8b-7dc8833756d0","name":"Local","url":null,"type":2}]},
            {"id":"b26ad4dc-b891-4f3a-9e0a-d0adbafe1888","normalizedVersion":"1.0.10","version":"1.0.10","isLatest":false,"isListed":true,"storageId":"D4694C066CB073DC5B2D1066CEB312E9D19E85B1B126AD7429C8A5909996C79000","views":[{"id":"434175c8-dbfc-4b58-8b8b-7dc8833756d0","name":"Local","url":null,"type":2}]},
            {"id":"c8a5e3df-38f0-42bc-bf48-a3db28d14304","normalizedVersion":"1.0.0-preview9","version":"1.0.0-preview9","isLatest":false,"isListed":true,"storageId":"F0641836EA4B66124FE6E0BFBF7BE0573596130CFB2DC59EBCD1BB0BA5304DFB00","views":[{"id":"434175c8-dbfc-4b58-8b8b-7dc8833756d0","name":"Local","url":null,"type":2}]}
          ]
        },
        "packageVersion":{
          "author":"yang-er",
          "description":"UI kit for ASP.NET Core with moduling support. The blogging abstraction",
          "protocolMetadata":{
            "schemaVersion":1,
            "data":{
              "licenseUrl":"https://licenses.nuget.org/MIT",
              "projectUrl":"https://github.com/namofun/blogging",
              "releaseNotes":"Blogging Module",
              "requireLicenseAcceptance":false,
              "title":"Blogging.Abstraction",
              "licenseExpression":"MIT"
            }
          },
          "tags":["blog"],
          "dependencies":[
            {"packageName":"Markdig.Service","group":".NETStandard2.0","versionRange":"[0.18.3.1, )"},
            {"packageName":"SatelliteSite.Abstraction","group":".NETStandard2.0","versionRange":"[1.0.38, )"}
          ],
          "otherVersions":[
            {
              "id":"565d0e22-f630-4162-823b-08e38b3cd09f",
              "normalizedVersion":"1.1.12",
              "version":"1.1.12",
              "isLatest":true,
              "isListed":true,
              "storageId":"6986C63D79F179260D203240496FF0FBC944CDC2A645F78A6CDBC2E3F1B3CCAB00",
              "views":[
                {"id":"e3d1736a-e41b-439b-9f96-261821c485e4","name":"Release","url":null,"type":1},
                {"id":"434175c8-dbfc-4b58-8b8b-7dc8833756d0","name":"Local","url":null,"type":2}
              ]
            },
            {"id":"99670608-5c90-48f7-b702-5e64e7ab7d45","normalizedVersion":"1.0.11","version":"1.0.11","isLatest":false,"isListed":true,"storageId":"00D48FD335AF88C18DA12B97BC82617F532FEFA91D13DA54A0410B017E1689C000","views":[{"id":"434175c8-dbfc-4b58-8b8b-7dc8833756d0","name":"Local","url":null,"type":2}]},
            {"id":"b26ad4dc-b891-4f3a-9e0a-d0adbafe1888","normalizedVersion":"1.0.10","version":"1.0.10","isLatest":false,"isListed":true,"storageId":"D4694C066CB073DC5B2D1066CEB312E9D19E85B1B126AD7429C8A5909996C79000","views":[{"id":"434175c8-dbfc-4b58-8b8b-7dc8833756d0","name":"Local","url":null,"type":2}]},
            {"id":"c8a5e3df-38f0-42bc-bf48-a3db28d14304","normalizedVersion":"1.0.0-preview9","version":"1.0.0-preview9","isLatest":false,"isListed":true,"storageId":"F0641836EA4B66124FE6E0BFBF7BE0573596130CFB2DC59EBCD1BB0BA5304DFB00","views":[{"id":"434175c8-dbfc-4b58-8b8b-7dc8833756d0","name":"Local","url":null,"type":2}]}
          ],
          "sourceChain":[],
          "id":"565d0e22-f630-4162-823b-08e38b3cd09f",
          "normalizedVersion":"1.1.12",
          "version":"1.1.12",
          "isLatest":true,
          "isListed":true,
          "storageId":"6986C63D79F179260D203240496FF0FBC944CDC2A645F78A6CDBC2E3F1B3CCAB00",
          "views":[
            {"id":"e3d1736a-e41b-439b-9f96-261821c485e4","name":"Release","url":null,"type":1},
            {"id":"434175c8-dbfc-4b58-8b8b-7dc8833756d0","name":"Local","url":null,"type":2}
          ],
          "publishDate":"\/Date(1619941109297)\/"},
          "result":2
        },
        "recycleBinPackagesResult":null,
        "pageSize":100,
        "userCanAdministerFeeds":false,
        "userCanCreateFeed":false,
        "retentionPolicyMinimumCountLimit":1,
        "retentionPolicyMaximumCountLimit":5000,
        "retentionPolicyMinimumDaysToKeepLimit":1,
        "retentionPolicyMaximumDaysToKeepLimit":365,
        "retentionPolicyCountLimitDefault":20,
        "retentionPolicyDaysToKeepLimitDefault":30,
        "defaultPublicUpstreamSources":[
          {"id":"67b9bb0d-31e7-4824-bb79-4a5e7f1fa862","name":"npmjs","location":"https://registry.npmjs.org/","protocol":"npm","upstreamSourceType":1,"status":0},
          {"id":"ee4152e4-192c-44a8-8009-90f825c2b9a4","name":"NuGet Gallery","location":"https://api.nuget.org/v3/index.json","protocol":"nuget","upstreamSourceType":1,"status":0},
          {"id":"fb12b4ee-5027-4c00-8eb7-aff7f1d7d536","name":"PyPI","location":"https://pypi.org/","protocol":"pypi","upstreamSourceType":1,"status":0},
          {"id":"7bfbf1b9-bd51-481b-82cc-82a8b2094fc8","name":"Maven Central","location":"https://repo.maven.apache.org/maven2/","protocol":"Maven","upstreamSourceType":1,"status":0}
        ],
        "collectionBuildIdentity":{
          "id":"f4923411-21fa-4357-9b60-fb912c24e3f2",
          "descriptor":"Microsoft.TeamFoundation.ServiceIdentity;7997cc0c-fecd-4964-bf9f-f7293007da5f:Build:061d0093-1d6b-42f4-8d3f-c743c0ec7b9c",
          "displayName":"Project Collection Build Service (tlylz)"
        },
        "projectBuildIdentity":{
          "id":"73a4cd7c-23da-4369-bb87-00e848a8b8d0",
          "descriptor":"Microsoft.TeamFoundation.ServiceIdentity;7997cc0c-fecd-4964-bf9f-f7293007da5f:Build:5f8d36de-7004-4c36-a8b5-8a4bda9eb598",
          "displayName":"namomo Build Service (tlylz)"
        },
        "everyoneGroup":null,
        "currentUserDescriptor":"System:PublicAccess;aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "batchOperationPageSize":100,
        "minimumSnapshotInstanceCount":25,
        "enabledFeatures":[
          "Packaging.Feed.CustomPublicUpstreams",
          "Packaging.Feed.WebAccess.Metrics",
          "Packaging.Feed.WebAccess.Provenance",
          "Packaging.Feed.SmartDependencies",
          "Packaging.Feed.GlobalPermissionsMapWellKnownIdentifier",
          "Packaging.Feed.ProjectScopedUPackUI",
          "Packaging.Feed.ProjectScopedUpstreams"
        ],
        "upstreamSourceLimit":20,
        "publicAccessMapping":null,
        "projectCollectionAdminGroupId":null,
        "everyoneGroupId":null,
        "isOrgAadBacked":false
      }
    }
}*/
