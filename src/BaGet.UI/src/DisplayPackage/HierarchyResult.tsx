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
