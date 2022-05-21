import { WASI } from '@wasmer/wasi/lib'
import browserBindings from '@wasmer/wasi/lib/bindings/browser'
import { lowerI64Imports } from "@wasmer/wasm-transformer"
import { WasmFs } from '@wasmer/wasmfs'

const wasmFilePath = '/wasmer-js-move-compile-demo.wasm'  // Path to our WASI module

// Instantiate new WASI and WasmFs Instances
// IMPORTANT:
// Instantiating WasmFs is only needed when running in a browser.
// When running on the server, NodeJS's native FS module is assigned by default
const wasmFs = new WasmFs()
wasmFs.fs.mkdirpSync("/tmp")

let wasi = new WASI({
  preopens: {
    "/tmp": "/tmp"
  },

  // Arguments passed to the Wasm Module
  // The first argument is usually the filepath to the executable WASI module
  // we want to run.
  args: [wasmFilePath],

  // Environment variables that are accesible to the WASI module
  env: {},

  // Bindings that are used by the WASI Instance (fs, path, etc...)
  bindings: {
    ...browserBindings,
    fs: wasmFs.fs
  }
})

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Async function to run our WASI module/instance
const startWasiTask =
  async pathToWasmFile => {
    // Fetch our Wasm File
    let response  = await fetch(pathToWasmFile)
    let wasmBytes = new Uint8Array(await response.arrayBuffer())

    // IMPORTANT:
    // Some WASI module interfaces use datatypes that cannot yet be transferred
    // between environments (for example, you can't yet send a JavaScript BigInt
    // to a WebAssembly i64).  Therefore, the interface to such modules has to
    // be transformed using `@wasmer/wasm-transformer`, which we will cover in
    // a later example

    // IMPORTANT EXTRA STEP!
    // We must transform the WebAssembly module interface!
    const loweredWasmBytes = await lowerI64Imports(wasmBytes)

    // Instantiate the WebAssembly file
    let wasmModule = await WebAssembly.compile(loweredWasmBytes);
    let instance = await WebAssembly.instantiate(wasmModule, {
      ...wasi.getImports(wasmModule)
    });
  
    try {
      wasi.start(instance)                      // Start the WASI instance
    } catch(e) {
      console.error(e)
    }

    // Output what's inside of /dev/stdout!
    let stdout = await wasmFs.getStdOut();
    console.log('Standard Output: ' + stdout);

    let htmlOut = stdout.replaceAll('\n', '<br/>')
    document.write(`${htmlOut}`) // Write stdout data to the DOM
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasiTask(wasmFilePath)