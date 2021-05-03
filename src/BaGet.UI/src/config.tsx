let config = {
  apiUrl: "__BAGET_PLACEHOLDER_API_URL__",
  azureArtifactsUrl: "https://pkgs.dev.azure.com/tlylz/5f8d36de-7004-4c36-a8b5-8a4bda9eb598/_packaging/c2949ad7-bda3-4f23-a41b-3109c9419cb7/nuget",
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

export { config };
