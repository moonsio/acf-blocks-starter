import path, { resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { glob } from "glob";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import BrowserSyncPlugin from "browser-sync-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const proxy = {
	adress: "moonsio.local",
	name: "moonsio",
};

// Find all block directories
const blockDirectories = fs
	.readdirSync(resolvePath(__dirname, "blocks"))
	.filter((file) =>
		fs.statSync(resolvePath(__dirname, "blocks", file)).isDirectory(),
	);

// Create entries for block SCSS files
const blockEntries = {};

// Process block directories to add SCSS entries
for (const blockName of blockDirectories) {
	const blockDir = resolvePath(__dirname, "blocks", blockName);

	// Add block.scss entry if it exists
	if (fs.existsSync(resolvePath(blockDir, "block.scss"))) {
		blockEntries[`blocks/${blockName}/block`] = resolvePath(
			blockDir,
			"block.scss",
		);
	}

	// Add editor.scss entry if it exists
	if (fs.existsSync(resolvePath(blockDir, "editor.scss"))) {
		blockEntries[`blocks/${blockName}/editor`] = resolvePath(
			blockDir,
			"editor.scss",
		);
	}
}

export default (env) => {
	// ----------------------------
	// Configuration: Entries
	// ----------------------------
	const entry = {
		script: resolvePath(__dirname, "assets/js/main.js"),
		style: resolvePath(__dirname, "assets/scss/main.scss"),
		...blockEntries,
	};

	// ----------------------------
	// Configuration: Output
	// ----------------------------
	const output = {
		filename: "[name].js",
		path: resolvePath(__dirname, "dist"),
		clean: true,
	};

	// ----------------------------
	// Configuration: Modules
	// ----------------------------

	const module = {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							sourceMap: true,
						},
					},
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: [],
							},
						},
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: true,
							sassOptions: {
								api: "modern",
								quietDeps: true,
								logger: {
									silent: true,
								},
							},
						},
					},
					"webpack-import-glob-loader",
				],
			},
		],
	};

	// ----------------------------
	// Configuration: Plugins
	// ----------------------------
	const defaultPlugins = [
		new MiniCssExtractPlugin({
			filename: "[name].css",
		}),
		// Copy PHP files and block.json from blocks to dist
		new CopyPlugin({
			patterns: [
				{
					from: "blocks/*/*.php",
					to: "[path][name][ext]",
					context: ".",
				},
				{
					from: "blocks/*/block.json",
					to: "[path][name][ext]",
					context: ".",
				},
				{
					from: "blocks/*/config.php",
					to: "[path][name][ext]",
					context: ".",
				},
			],
		}),
	];

	const devPlugins = [
		new BrowserSyncPlugin(
			{
				proxy: proxy?.adress,
				logPrefix: proxy?.name,
				ui: false,
				files: ["**/*.php", "**/*.css", "**/*.js"],
				reloadDebounce: 1000,
				open: false,
			},
			{ reload: false, open: false },
		),
	];

	const plugins =
		env.mode === "development" && proxy?.adress
			? [...defaultPlugins, ...devPlugins]
			: [...defaultPlugins];

	// ----------------------------
	// Configuration: Devtool
	// ----------------------------
	const devtool = env.mode === "development" ? "source-map" : false;

	// ----------------------------
	// Configuration: Optimization
	// ----------------------------
	const optimization = {
		minimize: env.mode === "production",
		minimizer: [
			new CssMinimizerPlugin({
				minimizerOptions: {
					preset: ["default", { discardComments: { removeAll: true } }],
				},
			}),
			new TerserPlugin({
				minify: TerserPlugin.swcMinify,
				terserOptions: {
					format: {
						comments: false,
					},
					compress: {
						drop_console: true,
					},
				},
				extractComments: false,
			}),
		],
		usedExports: true,
	};

	// ----------------------------
	// Configuration: Watch Options
	// ----------------------------
	const watchOptions = {
		aggregateTimeout: 500,
		ignored: "/node_modules/",
	};

	// ----------------------------
	// Configuration: Mode
	// ----------------------------
	const mode = env.mode;

	const config = {
		entry,
		output,
		module,
		plugins,
		devtool,
		optimization,
		watchOptions,
		mode,
	};

	return config;
};
