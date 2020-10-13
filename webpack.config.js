const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const pkg = require('./package.json');
const fs = require('fs');


const env = process.env.NODE_ENV
const econfig = {
    mode: env || 'development'
}



module.exports = function (env, argv) {
    
    let builddir = 'site';
    if (argv.mode == 'production') {
        if (!fs.existsSync('dist')) {
            fs.mkdirSync('dist');
        }
        fs.writeFileSync("dist/VERSION", pkg.version);
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
            //"scripts/writer": "./src/writer_worker.js",
            //"scripts/reader": "./src/reader_worker.js",
            //"styles/preview": "./src/styles/preview.less",
            "scripts/startup": "./src/startupscreen.js",
            "scripts/production": "./src/production_worker.js",
            //"scripts/production_node": "./src/production_worker_node.js"
            //"styles/site" : "./src/styles/site.less"
        }, //array!!!
        devtool: argv.mode != "production" ? 'inline-source-map' : "",

        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, builddir, "_system")
        },

        module: {
            rules: [
                /*
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },*/
                {
                    test: /\.svg$/,
                    loader: 'svg-inline-loader'
                },
                /*//
                {
                    test: /\.(less|css)$/,
                   // exclude: path.resolve(__dirname, 'src/bled'),
                    use: [
                        //MiniCssExtractPlugin.loader,
                        {
                            loader: 'style-loader',
                            options: {
                                insert: '.block_editor_outer_container',
                               // url: false
                               injectType: "lazyStyleTag"

                            }
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                //insert: '.block_editor_outer_container',
                                url: false
                            }
                        },
                        'less-loader'
                    ],
                },
                //*/
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
            new CopyPlugin([
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
                },
                //{ from: 'other', to: 'public' },
            ]),
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
                //latid_version: "1"                
            }
            ),


        ],
    };
}