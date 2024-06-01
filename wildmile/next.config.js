// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });

// module.exports = withBundleAnalyzer({});

module.exports = {
  // Experimental features configuration
  experimental: {
    esmExternals: "loose", // Allows importing ESM packages as CommonJS
    serverComponentsExternalPackages: ["mongoose"], // Prevents bundling for certain server packages
  },

  // Webpack configuration adjustments
  webpack: (config, { isServer, dev }) => {
    config.experiments = config.experiments || {};
    if (dev) {
      config.devtool = "source-map";
    }

    config.experiments.topLevelAwait = true; // Enabling top-level await in modules
    config.experiments.layers = true; // Enable layers experiment

    // Configuration for file watching, useful in development environments
    config.watchOptions = {
      poll: 1000, // Polling interval in milliseconds
      aggregateTimeout: 300, // Delay before rebuilding once the first file changed
    };

    // Adding 'canvas' to webpack externals to prevent it from being bundled
    config.externals = [...config.externals, "canvas"];

    return config;
  },
};
