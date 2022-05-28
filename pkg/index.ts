import { WasmFs } from '@wasmer/wasmfs'

export interface IMove {
  run(args: String[]):void
}

export class Move implements IMove {
  public fs?: WasmFs

  constructor(fs: WasmFs) {
    this.fs = fs
  }

  run(args: String[]):void {
    throw new Error('Method not implemented.')
  }
}
