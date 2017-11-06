// Use this webpack config for development, with `webpack --config webpack.development.config.js`

// process.traceDeprecation = true;
const webpack = require('webpack');
const _ = require('lodash');

const baseConfigFn = require('./webpack.base.config')
// Development webpack config
module.exports = (env) => {
  if (!env) env = {};
  const baseConfig = baseConfigFn(env);
  return _.merge(baseConfig, {
    output: _.merge({}, baseConfig.output, {
      chunkFilename: 'javascripts/chunks/[name].bundle.js',
    }),
    devtool: 'eval-source-map', // https://webpack.js.org/configuration/devtool/
    devServer: {
      contentBase: './public',
      inline: true,
      hot: false,  // Was trying to get live CSS refresh, won't work with ExtractTextPlugin without more fiddling? https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/30
      port: 3001,
      proxy: {
        '**': {
          target: 'http://localhost:3000',
          bypass: function(req, res, proxyOptions) {
            if (/^\/(javascripts|stylesimages|fonts|markdown|templates|lib)/.test(req.path) || /(\.js|\.css|\.html|\.map)$/.test(req.path)) {
              console.log("serve", req.path, "from webpack-dev-server");
              return req.path.replace(/^\/dev/, '');
            }
            console.log("     serve", req.path, "from normal dev server");
            return false;
          }
        }
      }
    },
    plugins: baseConfig.plugins.concat([
      new webpack.BannerPlugin({ // Label each module in the output bundle
        banner: "hash:[hash], chunkhash:[chunkhash], name:[name], filebase:[filebase], query:[query], file:[file]"
      }),
    ])
  })
}
