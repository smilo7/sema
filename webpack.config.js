const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';
const HtmlWebpackPlugin = require("html-webpack-plugin");
const LinkTypePlugin = require("html-webpack-link-type-plugin").HtmlWebpackLinkTypePlugin;
const WorkerPlugin = require("worker-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const LiveReloadPlugin = require("webpack-livereload-plugin");

// "watch:webpack": "webpack --watch --info-verbosity verbose --progress",
// "watch:webpack": "webpack-dev-server --content-base public",
// const { WebpackPluginServe: Serve } = require("webpack-plugin-serve");
// const serveOptions = {
// 	client: {
// 		address: "localhost:8080",
// 	},
// 	log: { level: "error" },
// 	liveReload: true,
// 	host: "localhost",
// 	port: 8080,
// 	open: true,
// 	static: path.join(__dirname, "public"),
// };


module.exports = {
  // entry: {
  //   bundle: ['./client/main.js', 'webpack-plugin-serve/client'],
  // },
	entry: {
		bundle: ["./client/main.js"],
		// parser: ["./workers/parser.worker.js"],
		// ml: ["./workers/ml.worker.js"],
		// il: ["./workers/il.worker.js"]
	},
	resolve: {
		alias: {
			svelte: path.resolve("node_modules", "svelte"),
			// Workers: path.resolve(__dirname, "./client/workers/"),
		},
		extensions: [".mjs", ".js", ".svelte"],
		mainFields: ["svelte", "browser", "module", "main"],
	},
	output: {
		path: path.join(__dirname, "public"),
		filename: "[name].js",
		chunkFilename: "[name].[id].js",
		publicPath: "/", // this is required for the client-side router to set relative paths from '/'
		globalObject: `(typeof self !== 'undefined' ? self : this)`,
	},
	// resolve: {
  //   alias: {
  //     three$: 'three/build/three.min.js',
  //     'three/.*$': 'three',
  //      // don't need to register alias for every module
  //   },
  //   // ...
	// },
	module: {
		rules: [
			// {
			// 	test: /\.workers\.js$/,
			// 	use: {
			// 		loader: "worker-loader",
			// 		options: { publicPath: "/workers/" },
			// 	},
			// },
			{
				test: /\.js$/,
				exclude: [
					// path.resolve(__dirname, "./client/workers/il.worker.js"),
					// path.resolve(__dirname, "./client/workers/il.worker.js"),
					// path.resolve(__dirname, "./client/workers/parser.worker.js"),
					// path.resolve(__dirname, "./client/workers/ml.worker.js"),
					// path.resolve(__dirname, "./client/workers/tfjs.min.js"),
				],
			},
			{
				test: /\.svelte$/,
				use: {
					loader: "svelte-loader",
					options: {
						emitCss: true,
						hotReload: true,
						dev: true,
					},
				},
			},
			{
				test: /\.css$/,
				// exclude: [ path.resolve(__dirname, "client/global.css") ],
				use: [
					/**
					 * MiniCssExtractPlugin doesn't support HMR.
					 * For developing, use 'style-loader' instead.
					 * */
					prod ? MiniCssExtractPlugin.loader : "style-loader",
					"css-loader",
				],
			},
			// {
			// 	test: /tutorial.json/,
			// 	loader: "file-loader",
			// 	options: {
			// 		name: "tutorial.json",
			// 	},
			// },
			{
				test: /\.glsl$/,
				loader: "file-loader", // files should NOT get processed, only emitted
				// include: ['./**/*.glsl', '../../../**/*.glsl'],
				options: {
					compress: false,
					name: "[name].glsl",
				},
			},

			{
				test: /\.ne$/,
				use: ["raw-loader"],
			},
			{
				test: /\.tf$/i,
				loader: ["raw-loader"],
			},
			{
				test: /\.sem$/,
				use: ["raw-loader"],
			},
			{
				test: /maxi-processor.js/,
				loader: "file-loader", // files should NOT get processed, only emitted
				options: {
					name: "maxi-processor.js",
				},
			},
			{
				test: /lalolib.js/,
				loader: "file-loader", // files should NOT get processed, only emitted
				options: {
					name: "lalolib.js",
				},
			},
			{
				test: /svd.js/,
				loader: "file-loader", // files should NOT get processed, only emitted
				options: {
					name: "svd.js",
				},
			},
			{
				test: /mlworkerscripts.js/,
				loader: "file-loader", // files should NOT get processed, only emitted
				options: {
					name: "mlworkerscripts.js",
				},
			},
			{
				test: /lodash.js/,
				loader: "file-loader", // files should NOT get processed, only emitted
				options: {
					name: "lodash.js",
				},
			},
			{
				test: /ringbuf.js/,
				loader: "file-loader", // files should NOT get processed, only emitted
				options: {
					name: "ringbuf.js",
				},
			},
			{
				//WASM LOADER
				// Issue pointed out by Surma on the following gist – https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
				// wasm files should not be processed but just be emitted
				// and we want to have their public URL.

				//note - need to import this in audioengine.js to get webpack to trigger this filter

				test: /maximilian.wasmmodule.js$/,
				type: "javascript/auto",
				// loader: 'wasm-loader', // WASM files get processed [NOT what we want]
				loader: "file-loader", // WASM files are only emitted to the final dist, NOT processed
				options: {
					// mimetype: 'application/wasm',
					name: "maximilian.wasmmodule.js",
				},
			},
			{
				//WASM LOADER
				// Issue pointed out by Surma on the following gist – https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
				// wasm files should not be processed but just be emitted
				// and we want to have their public URL.

				//note - need to import this in audioengine.js to get webpack to trigger this filter

				test: /open303.wasmmodule.js$/,
				type: "javascript/auto",
				// loader: 'wasm-loader', // WASM files get processed [NOT what we want]
				loader: "file-loader", // WASM files are only emitted to the final dist, NOT processed
				options: {
					// mimetype: 'application/wasm',
					name: "open303.wasmmodule.js",
				},
			},
			{
				//WASM LOADER
				// Issue pointed out by Surma on the following gist – https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
				// wasm files should not be processed but just be emitted
				// and we want to have their public URL.

				//note - need to import this in audioengine.js to get webpack to trigger this filter

				test: /maximilian.transpile.js$/,
				type: "javascript/auto",
				// loader: 'wasm-loader', // WASM files get processed [NOT what we want]
				loader: "file-loader", // WASM files are only emitted to the final dist, NOT processed
				options: {
					// mimetype: 'application/wasm',
					name: "maximilian.transpile.js",
				},
			},
			{
				//IMAGE LOADER
				test: /\.(jpe?g|png|gif|svg)$/i,
				loader: "file-loader",
			},
			{
				test: /favicon.ico/,
				loader: "file-loader", // files should NOT get processed, only emitted
				options: {
					name: "favicon.ico",
				},
			},
			{
				//AUDIO SAMPLE LOADER
				test: /\.(mp3|wav)$/,
				use: {
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "samples",
					},
				},
			},
		],
	},
	mode,
	plugins: [

		new webpack.ProgressPlugin(),
		// new Serve(serveOptions), // alternative to webpack-dev-server

		// new webpack.ProvidePlugin({
    //   THREE: 'three',
    //   // ...
    // }),
		new LiveReloadPlugin({
			protocol: "http",
			port: 5001,
			hostname: "localhost",
			appendScriptTag: true,
		}),
		new CopyWebpackPlugin([
			{
				context: "./assets",
				from: "tutorial",
				to: "tutorial",
				toType: "dir",
			},
			{
				context: "./assets",
				from: "languages",
				to: "languages",
				toType: "dir",
			},
		]),
		new HtmlWebpackPlugin({
			noscriptHeader:
				"To run Sema, please enable Javascript in the browser configuration",
			template: "./client/index.html",
			filename: "./index.html", //relative to root of the application
			excludeChunks: ["worker"],
		}),
		new LinkTypePlugin({
			"**/*.css": "text/css",
		}),
		new MiniCssExtractPlugin({
			filename: "[name].css",
		}),
		// new WorkerPlugin(),

		new CleanWebpackPlugin(),

		// new webpack.HotModuleReplacementPlugin(),
		// new webpack.NoEmitOnErrorsPlugin(),
	],
	devServer: {
		stats: "errors-only",
		host: `localhost`, // Defaults to `localhost`
		port: 8080, // Defaults to 8080
		open: false, // Open the page in browser
		overlay: true, // overlay for capturing compilation related warnings and errors
		publicPath: "/",
		watchContentBase: true,
		hot: false,
		liveReload: true,
    historyApiFallback: {
      rewrites: [
        { from: /\/playground/, to: '/'},
        { from: /^\/tutorial\/.*$/, to: '/' },
        { from: /./, to: '/404.html' }
      ]
    }
	},
	devtool: prod ? false : "source-map",
	// Issue pointed out by Surma on the following gist – https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
	// This is necessary due to the fact that emscripten puts both Node and web
	// code into one file. The node part uses Node’s `fs` module to load the wasm
	// file.
	// Issue: https://github.com/kripken/emscripten/issues/6542.
	// browser: {
	//   "fs": false
	// },
	// There is a further correction on the thread, which is congruent with what I had before
	node: {
		fs: "empty",
	},
	// watch: true, // ← important: webpack and the server will continue to run in watch mode
};
