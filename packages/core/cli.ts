import { WASI, WASIPreopenedDirs } from '@wasmer/wasi/lib'
import { WasmFs } from '@wasmer/wasmfs'

export interface IMoveOption {
    pwd?: string
    preopens?: [string]
}

export class Cli {
    private wasmFs: WasmFs

    constructor(wasmFs: WasmFs) {
        this.wasmFs = wasmFs
    }

    async run(args?: string[]): Promise<any> {
    }
}