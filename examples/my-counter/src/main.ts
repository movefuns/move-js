import './style.css'

import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage } from '@starcoin/move-js'

const startWasiTask = async (app: HTMLDivElement) => {
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
  const hash = wasmfs.fs.readFileSync("/workspace/my-counter/target/starcoin/release/hash.txt")

  const base64Data = blobBuf.toString("base64")
  console.log("my-counter blob:", base64Data)

  app.innerHTML = `
      <h1>my-counter blob:</h1>
      ${base64Data}
      ${hash}
    `
}

const app = document.querySelector<HTMLDivElement>('#app')!
startWasiTask(app)



