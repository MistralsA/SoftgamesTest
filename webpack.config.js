var path = require('path');
var TWEEN = require('@tweenjs/tween.js');

module.exports = {
    entry: "./src/main.ts",
    output: {
        filename: "./bundle.js",
    },
	mode: "development",

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' as resolvable extensions.
        extensions: [".ts", ".js"]
    },

    module: {
		rules: [
			{
                test: /\.tsx?$/,
                loader: 'ts-loader'
			}
		]
    }
};
