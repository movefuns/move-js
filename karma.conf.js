module.exports = function(config) {
	config.set({
		plugins: [
			'karma-jasmine',
			'karma-mocha-reporter',
			'karma-chrome-launcher',
			'karma-rollup-preprocessor',
		],

		frameworks: ['jasmine'],
		reporters: ['mocha'],
		browsers: ['ChromeHeadless'],

		logLevel: config.LOG_INFO, // disable > error > warn > info > debug
		captureTimeout: 60000,
		autoWatch: true,
		singleRun: false,
		colors: true,
		port: 9876,

		basePath: '',
		files: [
			{ pattern: 'test/**/*.test.ts', watched: false },
		],
		exclude: [],

		preprocessors: {
			'test/**/*.test.ts': ['rollup'],
		},

		rollupPreprocessor: {
			output: {
				name: 'move-js',
				format: 'iife',
				sourcemap: 'inline',
			},
			plugins: [
				require('rollup-plugin-node-resolve')({
					extensions: ['.js', '.ts'],
				}),
				require('rollup-plugin-commonjs')({
					include: 'node_modules/**',
					extensions: ['.js', '.ts'],
				}),
				require('rollup-plugin-babel')({
					exclude: 'node_modules/**',
					extensions: ['.js', '.ts'],
				}),
			],
		}
	})
}