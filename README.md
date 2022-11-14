# move-js

Javascript version of the move language compiler and disassemble

## Features
- Compiling move package into blob and generate hash
- Disassemble contract

## Example

* Compiling move package into blob example
```ts
import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage } from '@starcoin/move-js'

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

    const hash = wasmfs.fs.readFileSync("/workspace/my-counter/target/starcoin/release/hash.txt")
    console.log("my-counter blob hash:", hash)
}

startWasiTask()
```

* Disassemble contract example
```ts
import { WasmFs } from '@wasmer/wasmfs'
import { Disassemble } from '@starcoin/move-js'

const startDisassembleTask = async (app: HTMLDivElement) => {
  const wasmfs = new WasmFs()

  const dp = new Disassemble(wasmfs)

  // Chain code
  const account_scripts = "you code"

  dp.disassemble("account_scripts", account_scripts, (ok: boolean, data: string) => {
    console.log(ok)
    console.log(data)
  })

  app.innerHTML = `
      <h1>view disassemble in console:</h1>
    `
}

const app = document.querySelector<HTMLDivElement>('#app')!
startDisassembleTask(app)
```
