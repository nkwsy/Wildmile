// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });

// module.exports = withBundleAnalyzer({});

module.exports = {
  webpack: (config, context) => {
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

  experimental: {},
};
