# move-js

Javascript version of the move language compiler, supports compiling Move code into move bytecode in the browser.

## Features
- Compiling move package into blob

## Example

```ts
import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage } from '@yubing744/move-js'

const startWasiTask = async () => {
    const wasmfs = new WasmFs()
    const git = new Git(wasmfs)

    await git.download("/data/starcoin-framework.zip", "/workspace/starcoin-framework")
    await git.download("/data/my-counter.zip", "/workspace/my-counter")

    const mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/my-counter",
      test: false,
      alias: new Map([
        ["StarcoinFramework", "/workspace/starcoin-framework"]
      ]),
      initFunction: "0xABCDE::MyCounter::init"
    })
    
    await mp.build()

    const blobBuf = wasmfs.fs.readFileSync("/workspace/my-counter/target/starcoin/release/package.blob")
    const base64Data = blobBuf.toString("base64")
    console.log("my-counter blob:", base64Data)
}

startWasiTask()
```