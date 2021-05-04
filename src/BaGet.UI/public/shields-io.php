<?php
if (!isset($_GET['p'])) {
	http_response_code(404);
	die();
}

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, 'https://feeds.dev.azure.com/tlylz/_apis/Contribution/HierarchyQuery/project/5f8d36de-7004-4c36-a8b5-8a4bda9eb598');
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_NOBODY, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_POSTFIELDS, '{"contributionIds":["ms.feed.package-hub-data-provider"],"dataProviderContext":{"properties":{"sourcePage":{"url":"https://dev.azure.com/tlylz/namomo/_packaging?_a=package&feed=namofun&package='.urlencode($_GET['p']).'&protocolType=NuGet&view=versions","routeId":"ms.feed.packaging-hub-route","routeValues":{"project":"namomo","controller":"ContributedPage","action":"Execute"}}}}}');
curl_setopt($curl, CURLOPT_HTTPHEADER, [
	'Accept: application/json;api-version=5.0-preview.1;excludeUrls=true;enumsAsNumbers=true;msDateFormat=true;noArrayWrap=true',
	'Content-Type: application/json',
]);

$resp = curl_exec($curl);
$return = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($return != 200) {
	http_response_code($return);
	die();
}

$rep = json_decode($resp, true);
$root = $rep['dataProviders']['ms.feed.package-hub-data-provider']['packageDetailsResult'];

if ($root['package'] === null || $root['packageVersion'] === null) {
	http_response_code(404);
	die();
}

header('Content-Type: application/json');
echo json_encode([
	'schemaVersion' => 1,
	'label' => $root['package']['name'],
	'message' => $root['packageVersion']['version'],
	'color' => 'blue',
	'cacheSeconds' => 600,
]);
