// Karma configuration
// Generated on Tue May 24 2022 14:32:56 GMT+0000 (Coordinated Universal Time)
// process.env.CHROME_BIN = require('puppeteer').executablePath()

// load rollup config
import rollupConfigFunc from './rollup.config.js';
let rollupConfig = rollupConfigFunc({environment:"test"})[0]

export default config => {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // glob test files
      { pattern: 'test/**/*.test.ts', watched: false },

      // loading assets, accessed like http://localhost:[PORT]/base/test/data/my-counter.zip
      { pattern: 'test/**/*.zip', watched: false, included: false, served: true, nocache: false },
    ],

    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      'test/**/*.test.ts': ['rollup2'],
    },

    rollupPreprocessor: {
			/**
			 * This is just a normal Rollup config object,
			 * except that `input` is handled for you.
			 */
			plugins: rollupConfig.plugins,
			output: {
				name: 'move',
        format: 'iife',
				sourcemap: 'inline',
			},
		},

    client: {
      jasmine: {
        random: true,
        seed: '4321',
        oneFailurePerSpec: true,
        failFast: true,
        timeoutInterval: 1000
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['mocha'],


    // web server port
    port: 9877,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity
  })
}
