
import { WASI, WASIPreopenedDirs } from '@wasmer/wasi/lib'
import browserBindings from '@wasmer/wasi/lib/bindings/browser'
import { WasmFs } from '@wasmer/wasmfs'
import loadMoveWasmModule from './move_bg'

export interface IMove {
  run(args?: string[]):Promise<void>
}

export interface IMoveOption {
    pwd?: string,
    preopens?: [String]
}

export class Move implements IMove {
  private wasmFs: WasmFs
  private opts?:IMoveOption

  constructor(wasmFs: WasmFs, opts?:IMoveOption) {
    this.wasmFs = wasmFs
    this.opts = opts

    if (this.opts == null) {
      this.wasmFs.fs.mkdirpSync("/tmp")
      this.opts = {
        pwd: "/tmp"
      }
    }
  }

  async run(args?: string[]): Promise<void> {
    let opts = this.opts

    let preopens:WASIPreopenedDirs = {}
    if (opts.preopens) {
      preopens[opts.pwd] = opts.pwd

      opts.preopens.forEach(function (value:string) {
        preopens[value] = value
      });
    } else {
      preopens[opts.pwd] = opts.pwd
    }

    console.log("preopens:", preopens)

    let wasi = new WASI({
        preopens: preopens,
        
        // Arguments passed to the Wasm Module
        // The first argument is usually the filepath to the executable WASI module
        // we want to run.
        args: args,
        
        // Environment variables that are accesible to the WASI module
        env: {
          "PWD": opts.pwd
        },
        
        // Bindings that are used by the WASI Instance (fs, path, etc...)
        bindings: {
            ...browserBindings,
            fs: this.wasmFs.fs
        }
    })

    // Instantiate the WebAssembly file
    let wasmModule = await loadMoveWasmModule();
    let instance = await WebAssembly.instantiate(wasmModule, {
      ...wasi.getImports(wasmModule)
    });

    try {
      // @ts-ignore
      wasi.start(instance)                      // Start the WASI instance
    } catch(e) {
      console.error(e)
    }

    // Output what's inside of /dev/stdout!
    let stdout = await this.wasmFs.getStdOut();
    console.log('Standard Output: ' + stdout);

    let stderr = await this.getStdErr()
    console.error('Standard Error: ' + stderr);
  }

  async getStdErr() {
    let promise = new Promise(resolve => {
        resolve(this.wasmFs.fs.readFileSync("/dev/stderr", "utf8"));
    });

    return promise;
  }
}


