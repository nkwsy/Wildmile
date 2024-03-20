module.exports = {
  webpack: (config, context) => {
    (config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }),
      (config.resolve.alias = {
        ...config.resolve.alias,

        canvas: false,
      });

    return config;
  },
  experimental: {
    logging: {
      level: "verbose",
    },
  },
};
