import { WASI, WASIPreopenedDirs } from '@wasmer/wasi/lib'
import browserBindings from '@wasmer/wasi/lib/bindings/browser'
import { WasmFs } from '@wasmer/wasmfs'
import loadMoveWasmModule from './move_bg'

export interface IMove {
  run(args?: string[]): Promise<any>
}

export interface IMoveOption {
  pwd?: string
  preopens?: [string]
}

export class Move implements IMove {
  private wasmFs: WasmFs
  private opts?: IMoveOption

  constructor(wasmFs: WasmFs, opts?: IMoveOption) {
    this.wasmFs = wasmFs
    this.opts = opts

    if (this.opts == null) {
      this.wasmFs.fs.mkdirpSync('/tmp')
      this.opts = {
        pwd: '/tmp',
      }
    }
  }

  async run(args?: string[]): Promise<any> {
    const opts = this.opts

    const preopens: WASIPreopenedDirs = {}
    if (opts.preopens) {
      preopens[opts.pwd] = opts.pwd

      opts.preopens.forEach((value: string) => {
        preopens[value] = value
      })
    } else {
      preopens[opts.pwd] = opts.pwd
    }

    const wasi = new WASI({
      preopens,

      // Arguments passed to the Wasm Module
      // The first argument is usually the filepath to the executable WASI module
      // we want to run.
      args,

      // Environment variables that are accesible to the WASI module
      env: {
        PWD: opts.pwd,
      },

      // Bindings that are used by the WASI Instance (fs, path, etc...)
      bindings: {
        ...browserBindings,
        fs: this.wasmFs.fs,
      },
    })

    // Instantiate the WebAssembly file
    const wasmModule = await loadMoveWasmModule()
    const instance = await WebAssembly.instantiate(wasmModule, {
      ...wasi.getImports(wasmModule),
    })

    try {
      // @ts-ignore
      wasi.start(instance) // Start the WASI instance
    } catch (e) {
      console.error(e)
    }

    // Output what's inside of /dev/stdout!
    const stdout = await this.wasmFs.getStdOut()

    const stderr = await this.getStdErr()
    if (stderr) {
      console.error('Standard Error: \n' + stderr)
    }

    return stdout
  }

  async getStdErr() {
    const promise = new Promise((resolve) => {
      resolve(this.wasmFs.fs.readFileSync('/dev/stderr', 'utf8'))
    })

    return promise
  }
}
