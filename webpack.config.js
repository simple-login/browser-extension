const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { version, betaRev } = require('./package.json');
const fs = require('fs');


const loadDevConfig = () => {
  if (fs.existsSync('./.dev.json')) {
    return JSON.parse(fs.readFileSync('./.dev.json').toString());
  } else {
    return JSON.parse(fs.readFileSync('./.dev.sample.json').toString());
  }
};

const devConfig = loadDevConfig();

const config = {
  mode: process.env.NODE_ENV,
  context: __dirname + '/src',
  entry: {
    'background': './background/index.js',
    'popup/popup': './popup/popup.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
            presets: [
              {'plugins': ['@babel/plugin-proposal-class-properties']
            }
          ]
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.sass$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/images/',
          emitFile: false,
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/fonts/',
          emitFile: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'icons', to: 'icons', globOptions: { ignoreFiles: ['icon.xcf'] } },
        { from: 'images', to: 'images' },
        { from: 'content_script', to: 'content_script' },
        { from: 'popup/popup.html', to: 'popup/popup.html', transform: transformHtml },
        {
          from: 'manifest.json',
          to: 'manifest.json',
          transform: (content) => {
            const jsonContent = JSON.parse(content);
            jsonContent.version = version;

            if (config.mode === 'development') {              
              jsonContent.permissions = jsonContent.permissions.concat(devConfig.permissions);
            }

            if (process.env.BETA) {
              const geckoId = jsonContent.browser_specific_settings.gecko.id;
              jsonContent.name = jsonContent.name.replace('SimpleLogin', 'SimpleLogin (BETA)');
              jsonContent.icons = {
                '48': 'icons/icon_beta_48.png',
                '128': 'icons/icon_beta_128.png'
              };
              jsonContent.version = version + '.' + betaRev;
              jsonContent.browser_specific_settings.gecko.id = geckoId.replace('@', '-beta@');
            }

            if (process.env.FIREFOX) {
              jsonContent.background = {
                "scripts": ["background.js"]
              }
            } else { // CHROME
              jsonContent.background = {
                "service_worker": "background.js",
                "type": "module"
              }
            }

            if (process.env.LITE) {
              // Remove "All sites" permissions
              const PERMISSIONS_TO_REMOVE = [
                "https://*/*",
                "http://*/*"
              ];

              const finalPermissions = [];
              for (const perm of jsonContent.permissions) {
                if (!PERMISSIONS_TO_REMOVE.includes(perm)) {
                  finalPermissions.push(perm);
                }
              }
              jsonContent.permissions = finalPermissions;

              // Change metadata
              jsonContent.name = "SimpleLogin Without SL icon";
              jsonContent.short_name = "SimpleLogin Without SL icon";
            }

            if (process.env.MAC) {
              jsonContent.permissions.push("nativeMessaging");
            }

            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ]
    }),
  ],
};

if (config.mode === 'development') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'devConfig': JSON.stringify(devConfig),
      'process.env.BETA': JSON.stringify(!!process.env.BETA),
    }),
  ]);
}

if (process.env.MAC){
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env.MAC': JSON.stringify(!!process.env.MAC),
    }),
  ]);
}

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'devConfig': 'null',
      'process.env': {
        'NODE_ENV': '"production"',
        'BETA': JSON.stringify(!!process.env.BETA),
      },
    }),
  ]);
}

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
    devConfig,
  });
}

if (config.mode === 'production') {
  config.devtool="source-map";
} else {
  config.devtool="cheap-source-map";
}

module.exports = config;