// import rust from "@wasm-tool/rollup-plugin-rust";

// export default {
//     input: {
//         foo: "Cargo.toml",
//     },
//     plugins: [
//         rust(),
//     ],
// };

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';
import { wasm } from '@rollup/plugin-wasm';
// import smartAsset from "rollup-plugin-smart-asset"
import url from '@rollup/plugin-url';

const LIBRARY_NAME = 'Library'; // Change with your library's name
const EXTERNAL = []; // Indicate which modules should be treated as external
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

const makeConfig = (env = 'development') => {
    let bundleSuffix = '';

    if (env === 'production') {
        bundleSuffix = 'min.';
    }

    const config = {
        input: 'pkg/git.ts',
        external: EXTERNAL,
        output: [
            {
                banner,
                name: LIBRARY_NAME,
                file: `dist/${LIBRARY_NAME}.umd.${bundleSuffix}js`, // UMD
                format: 'umd',
                exports: 'auto',
                globals: GLOBALS
            },
            {
                banner,
                file: `dist/${LIBRARY_NAME}.cjs.${bundleSuffix}js`, // CommonJS
                format: 'cjs',
                exports: 'auto',
                globals: GLOBALS
            },
            {
                banner,
                file: `dist/${LIBRARY_NAME}.esm.${bundleSuffix}js`, // ESM
                format: 'es',
                exports: 'named',
                globals: GLOBALS
            }
        ],
        plugins: [
            // wasm({
            //     maxFileSize: 1000000000,
            // }),
            // smartAsset({
            //     url: 'inline',
            //     extensions: ['.wasm'],
            // }),
            url({
                include: ['**/*.wasm'],
                limit: 14336000,
                // limit: 0,
            }),
            // Uncomment the following 2 lines if your library has external dependencies
            resolve(), // teach Rollup how to find external modules
            commonjs(),
            typescript({
                rollupCommonJSResolveHack: false,
                clean: true,          
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