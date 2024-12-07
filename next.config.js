const webpack = require('webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      crypto: false,
    }
    
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    )
    
    config.ignoreWarnings = [
      {
        module: /node_modules\/libheif-js/,
      }
    ]

    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com',
        port: '',
        pathname: '/outputs/**',
      },
    ],
  },
}

module.exports = nextConfig 