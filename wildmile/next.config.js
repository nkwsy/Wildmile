// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });

// module.exports = withBundleAnalyzer({});

module.exports = {
  experimental: {
    esmExternals: "loose", // <-- add this
    serverComponentsExternalPackages: ["mongoose"], // <-- and this
  },
  webpack: (config, context) => {
    config.experiments = {
      topLevelAwait: true,
    };
    (config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }),
      (config.externals = [...config.externals, "canvas"]);
    // (config.resolve.alias = {
    //   ...config.resolve.alias,

    //   canvas: false,
    // });

    return config;
  },
};
