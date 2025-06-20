const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['via.placeholder.com', 'maestro-api-dev.secil.biz'],
  },
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig;