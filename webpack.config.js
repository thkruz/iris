const path = require('node:path');
const { execSync } = require('node:child_process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const fs = require('node:fs');

// Private submodule (src/private, thkruz/signal-range-private). Absent in OSS
// clones. When its app entry exists the bundle may dynamic-import private
// modules through the @private alias; when it is absent the guarded imports
// are dead code and webpack never resolves the path (no stubs needed).
const PRIVATE_APP_DIR = path.resolve(__dirname, 'src/private/app');
const IS_PRIVATE = fs.existsSync(path.join(PRIVATE_APP_DIR, 'index.ts'));
// Authoring tools need the dev-server file endpoints, so they only exist in
// development builds of the private edition. Never true in a deployed build.
const IS_AUTHORING = IS_PRIVATE && process.env.NODE_ENV === 'development';

// Get git commit SHA at build time
const getGitCommitSha = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
};

// First loaded always wins, so load .env first
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '.env' });
}

// For production builds, also load .env.production
require('dotenv').config({ path: '.env.production' });

module.exports = {
  entry: {
    main: './src/index.ts',
    'popup-callback': './src/user-account/popup-callback.ts'
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@app': path.resolve(__dirname, 'src'),
      '@engine': path.resolve(__dirname, 'src/engine'),
      '@private': PRIVATE_APP_DIR,
    }
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              // Root-relative urls are server paths, not module requests. The
              // self-hosted fonts in src/fonts.css point at /fonts/*.woff2,
              // which CopyWebpackPlugin puts in the output as-is; without this
              // filter css-loader tries to resolve them against src/ and the
              // build fails with "Can't resolve '/fonts/...'".
              url: { filter: (url) => !url.startsWith('/') }
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|otf|ttf|woff|woff2)$/,
        type: 'asset/resource'
      },
      {
        test: /\.(mp3|wav)$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      chunks: ['main'],
      filename: 'index.html'
      // favicon: './public/favicon.ico'
    }),
    new HtmlWebpackPlugin({
      template: './public/auth/callback.html',
      chunks: ['popup-callback'],
      filename: 'auth/callback.html'
    }),
    new webpack.DefinePlugin({
      'process.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL),
      'process.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY),
      'process.env.PUBLIC_USER_API_URL': JSON.stringify(process.env.PUBLIC_USER_API_URL || 'https://user.keeptrack.space'),
      'process.env.PUBLIC_ASSETS_BASE_URL': JSON.stringify(process.env.PUBLIC_ASSETS_BASE_URL || ''),
      'process.env.PUBLIC_DEV_USER_IDS': JSON.stringify(process.env.PUBLIC_DEV_USER_IDS || ''),
      'process.env.PUBLIC_LOG_LEVEL': JSON.stringify(process.env.PUBLIC_LOG_LEVEL || 'LOG'),
      '__APP_VERSION__': JSON.stringify(require('./package.json').version),
      '__GIT_COMMIT_SHA__': JSON.stringify(getGitCommitSha()),
      '__IS_PRIVATE__': JSON.stringify(IS_PRIVATE),
      '__AUTHORING__': JSON.stringify(IS_AUTHORING),
    }),
    new CaseSensitivePathsPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/assets/logo.png', to: 'logo.png' },
        {
          from: 'public/assets/characters/',
          to: 'assets/characters/',
          globOptions: {
            ignore: ['**/*.png', '**/wip/**']
          }
        },
        {
          from: 'public/images/',
          to: 'images/',
          globOptions: {
            ignore: ['**/wip/**']
          }
        },
        // Self-hosted web fonts. Copied verbatim (not run through the
        // asset/resource rule) so the URLs in src/fonts.css stay stable.
        {
          from: 'public/fonts/',
          to: 'fonts/'
        },
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: false,
    port: 3000,
    hot: true,
    historyApiFallback: {
      rewrites: [
        // Don't redirect auth callback - serve the actual HTML file
        { from: /^\/auth\/callback/, to: '/auth/callback.html' },
        // All other routes go to index.html
        { from: /./, to: '/index.html' }
      ]
    },
    liveReload: false,
    // Private dev endpoints (scenario authoring file access). The module is
    // part of the private submodule; without it the dev server is unchanged.
    setupMiddlewares: (middlewares, devServer) => {
      const privateMiddleware = path.join(PRIVATE_APP_DIR, 'dev-middleware.cjs');
      if (IS_AUTHORING && fs.existsSync(privateMiddleware)) {
        require(privateMiddleware).register(devServer.app, { repoRoot: __dirname });
      }
      return middlewares;
    }
  }
};