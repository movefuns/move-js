import globals from "@allex/rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';
import { wasm } from '@rollup/plugin-wasm';

import { terser } from 'rollup-plugin-terser';

const LIBRARY_NAME = 'index'; // Change with your library's name
const EXTERNAL = ["@wasmer/wasmfs","@wasmer/wasi"]; // Indicate which modules should be treated as external
const GLOBALS = {}; // https://rollupjs.org/guide/en/#outputglobals

const banner = `/*!
 * ${pkg.name}
 * ${pkg.description}
 *
 * @version v${pkg.version}
 * @author ${pkg.author}
 * @homepage ${pkg.homepage}
 * @repository ${pkg.repository.url}
 * @license ${pkg.license}
 */`;

 const extensions = [
    '.js',
    '.ts',
    '.tsx'
  ]

const makeConfig = (env = 'development') => {
    let bundleSuffix = '';
    let sourcemapOption = 'inline'

    if (env === 'production') {
        bundleSuffix = 'min.';
        sourcemapOption = undefined
    }

    const config = {
        input: './pkg/index.ts',
        external: EXTERNAL,
        sourceMap: true,
        output: [
            {
                banner,
                name: LIBRARY_NAME,
                file: `dist/${LIBRARY_NAME}.iife.${bundleSuffix}js`, // IIFE
                format: 'iife',
                exports: 'auto',
                sourcemap: sourcemapOption,
                globals: GLOBALS
            },
            {
                banner,
                name: LIBRARY_NAME,
                file: `dist/${LIBRARY_NAME}.umd.${bundleSuffix}js`, // UMD
                format: 'umd',
                exports: 'auto',
                sourcemap: sourcemapOption,
                globals: GLOBALS
            },
            {
                banner,
                file: `dist/${LIBRARY_NAME}.cjs.${bundleSuffix}js`, // CommonJS
                format: 'cjs',
                exports: 'auto',
                sourcemap: sourcemapOption,
                globals: GLOBALS
            },
            {
                banner,
                file: `dist/${LIBRARY_NAME}.esm.${bundleSuffix}js`, // ESM
                format: 'es',
                exports: 'named',
                sourcemap: sourcemapOption,
                globals: GLOBALS
            }
        ],
        plugins: [
            wasm({
                targetEnv: "auto-inline"
            }),
            typescript({
                tsconfig: "./tsconfig.json",
                useTsconfigDeclarationDir: true,
                extensions: extensions,
                clean: true
            }),
            // Uncomment the following 2 lines if your library has external dependencies
            resolve({
                preferBuiltins: false,
            }), // teach Rollup how to find external modules
            commonjs(),
            globals(),
            builtins({
                extensions
            })
        ]
    };

    if (env === 'production') {
        config.plugins.push(terser({
            output: {
                comments: /^!/
            }
        }));
    }

    return config;
};

export default commandLineArgs => {
    const configs = [
        makeConfig()
    ];

    // Production
    if (commandLineArgs.environment === 'BUILD:production') {
        configs.push(makeConfig('production'));
    }

    return configs;
};