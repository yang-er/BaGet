using System;
using System.Threading;
using System.Threading.Tasks;
using BaGet.Core;
using BaGet.Protocol.Models;
using Microsoft.AspNetCore.Mvc;
using NuGet.Versioning;

namespace BaGet.Hosting
{
    /// <summary>
    /// The Package Metadata resource, used to fetch packages' information.
    /// See: https://docs.microsoft.com/en-us/nuget/api/registration-base-url-resource
    /// </summary>
    public class PackageMetadataController : Controller
    {
        private readonly IPackageMetadataService _metadata;

        public PackageMetadataController(IPackageMetadataService metadata)
        {
            _metadata = metadata ?? throw new ArgumentNullException(nameof(metadata));
        }

        // GET v3/package/{id}/shields-io.json
        [HttpGet]
        [ResponseCache(Duration = 600)]
        public async Task<IActionResult> ShieldsAsync(string id, CancellationToken cancellationToken)
        {
            var index = await _metadata.GetRegistrationIndexOrNullAsync(id, cancellationToken);
            if (index == null || index.Count != 1) return NotFound();
            var packageInfo = index.Pages[0];

            string releaseVersion;
            string packageName;

            if (packageInfo.ItemsOrNull == null || packageInfo.ItemsOrNull.Count == 0)
            {
                releaseVersion = packageInfo.Upper;
                packageName = id;
            }
            else
            {
                var upper = packageInfo.ItemsOrNull[packageInfo.Count - 1].PackageMetadata;
                packageName = upper.PackageId;
                releaseVersion = upper.Version;
            }

            return new ObjectResult(new
            {
                schemaVersion = 1,
                label = packageName,
                message = releaseVersion,
                color = NuGetVersion.Parse(releaseVersion).IsPrerelease ? "yellow" : "blue",
                cacheSeconds = 600,
            });
        }

        // GET v3/registration/{id}.json
        [HttpGet]
        public async Task<ActionResult<BaGetRegistrationIndexResponse>> RegistrationIndexAsync(string id, CancellationToken cancellationToken)
        {
            var index = await _metadata.GetRegistrationIndexOrNullAsync(id, cancellationToken);
            if (index == null)
            {
                return NotFound();
            }

            return index;
        }

        // GET v3/registration/{id}/{version}.json
        [HttpGet]
        public async Task<ActionResult<RegistrationLeafResponse>> RegistrationLeafAsync(string id, string version, CancellationToken cancellationToken)
        {
            if (!NuGetVersion.TryParse(version, out var nugetVersion))
            {
                return NotFound();
            }

            var leaf = await _metadata.GetRegistrationLeafOrNullAsync(id, nugetVersion, cancellationToken);
            if (leaf == null)
            {
                return NotFound();
            }

            return leaf;
        }
    }
}
