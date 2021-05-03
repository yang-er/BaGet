
export interface CountedResult<T> {
  count: number,
  value: T[],
}

export interface FeedView {
  _links: ReferenceLinks,
  id: string,
  name: string,
  type: FeedViewType,
  url: string,
  visibility: FeedVisibility,
}

export enum FeedViewType {
  implicit = "implicit",
  none = "none",
  release = "release",
}

export enum FeedVisibility {
  aadTenant = "aadTenant",
  collection = "collection",
  organization = "organization",
  private = "private",
}

export interface TinyPackageVersion {
  id: string,
  isLatest: boolean,
  isListed: boolean,
  normalizedVersion: string,
  publishDate: string,
  version: string,
}

export interface MinimalPackageVersion extends TinyPackageVersion {
  directUpstreamSourceId: string,
  isCachedVersion: boolean,
  isDeleted: boolean,
  packageDescription: string,
  storageId: string,
  views: FeedView[],
}

export interface PackageDependency {
  group: string,
  packageName: string,
  versionRange: string,
}

export interface PackageFile {
  children?: PackageFile[],
  name: string,
  protocolMetadata: ProtocolMetadata
}

export interface PackageVersion extends MinimalPackageVersion {
  _links: ReferenceLinks,
  author: string,
  deletedDate?: string,
  dependencies: PackageDependency[],
  description: string,
  files: PackageFile[],
  otherVersions: MinimalPackageVersion[],
  protocolMetadata: ProtocolMetadata,
  sourceChain?: UpstreamSource[],
  summary: string,
  tags: string[],
  url: string,
}

export interface ProtocolMetadata {
  data: {
    licenseExpression: string,
    licenseUrl: string,
    projectUrl: string,
    releaseNotes?: string,
    requireLicenseAcceptance: boolean,
    title: string,
  },
  schemaVersion: number,
}

export interface ReferenceLinks {
  links: object,
}

export interface UpstreamSource {
  deletedDate: string,
  displayLocation: string,
  id: string,
  internalUpstreamCollectionId: string,
  internalUpstreamFeedId: string,
  internalUpstreamProjectId: string,
  internalUpstreamViewId: string,
  location: string,
  name: string,
  protocol: string,
  status: UpstreamStatus,
  statusDetails: UpstreamStatusDetail,
  upstreamSourceType: UpstreamSourceType,
}

export enum UpstreamSourceType {
  internal = "internal",
  public = "public",
}

export enum UpstreamStatus {
  disabled = "disabled",
  ok = "ok",
}

export interface UpstreamStatusDetail {
  reason: string,
}
