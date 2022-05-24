import { WasmFs } from '@wasmer/wasmfs'

export interface IMove {
  run(args: String[])
}

export class Move implements IMove {
  public fs?: WasmFs

  constructor(fs: WasmFs) {
    this.fs = fs
  }

  run(args: String[]) {
    throw new Error('Method not implemented.')
  }
}
