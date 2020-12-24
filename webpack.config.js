const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const pkg = require('./package.json');
const fs = require('fs');


const env = process.env.NODE_ENV;

const econfig = {
  mode: env || 'development'
}



module.exports = function (env, argv) {

  let builddir = 'site';
  if (argv.mode == 'production') {
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist');
    }
    fs.writeFileSync("dist/VERSION", pkg.version  + "\nBuilt: " + (new Date()).toLocaleString());
    builddir = 'dist';
  }
  return {
    //externals: ["fs"],
    watch: argv.mode != 'production',
    target: 'web',
    optimization: {


    },


    mode: "development",
    entry: {
      "scripts/l4": './src/loader.js',
      "scripts/startup": "./src/startupscreen.js",
      "scripts/production": "./src/production_worker.js",
    }, //array!!!
    devtool: argv.mode != "production" ? 'inline-source-map' : "",

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, builddir, "_system")
    },

    module: {
      rules: [

        {
          test: /\.svg$/,
          loader: 'svg-inline-loader'
        },

        {
          test: /\.(less|css)$/,
          //exclude: path.resolve(__dirname, 'src/bled'),
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false
              }
            },
            'less-loader'
          ],
        },
        {
          test: /\.(scss)$/,
          //exclude: path.resolve(__dirname, 'src/bled'),
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false
              }
            },
            'sass-loader'
          ],
        },
        {
          test: /\.(woff|ttf)$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]'
            }
          }
          //'css-loader', 
          //'less-loader'
          ],
        }
      ]

    },
    plugins: [
      new CopyPlugin({
        //{
          //      from: path.resolve(__dirname, 'src/assets/settings.json'),
          //       to: path.resolve(__dirname, 'dist/_config.example/settings.json')
          //  },
          patterns: [
            {
              from: path.resolve(__dirname, 'src/assets/settings.json'),
              to: path.resolve(__dirname, 'dist/_config.example/settings.json')
            },
            {
              from: path.resolve(__dirname, 'src/assets/startup.css'),
              to: path.resolve(__dirname, argv.mode=='production' ? 'dist/_system/styles/startup.css' : 'site/_system/styles/startup.css')
            },
            {
              from: path.resolve(__dirname, 'src/assets/*.svg'),
              to: path.join(__dirname, 'dist/_system/scripts/'),
              toType: 'dir',
              flatten: true
            }
          ]
          //{ from: 'other', to: 'public' },
      }),
      new webpack.DefinePlugin({
        // Definitions...
        'VERSION': JSON.stringify(pkg.version)
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        inject: false
      }),

      new HtmlWebpackPlugin({

        title: 'LATID',
        chunks: ["scripts/l4"],
        filename: '../index.html',
        inject: "body",
        latid_version: pkg.version,
        template: path.join(__dirname, "src/templates/index.ejs"),
      }
      ),


    ],
  };
}
