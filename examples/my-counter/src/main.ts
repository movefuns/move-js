import './style.css'

import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage } from '@yubing744/move-js'

const startWasiTask = async (app: HTMLDivElement) => {
    let wasmfs = new WasmFs()
    let git = new Git(wasmfs)

    await git.download("/data/starcoin-framework.zip", "/workspace/starcoin-framework")
    await git.download("/data/my-counter.zip", "/workspace/my-counter")

    let mp = new MovePackage(wasmfs, "/workspace/my-counter", false, new Map([
      ["StarcoinFramework", "/workspace/starcoin-framework"]
    ]))
    
    await mp.build()

    let blobBuf = wasmfs.fs.readFileSync("/workspace/my-counter/target/starcoin/release/package.blob")
    let base64Data = blobBuf.toString("base64")
    console.log("my-counter blob:", base64Data)

    app.innerHTML = `
      <h1>my-counter blob:</h1>
      ${base64Data}
    `
}

const app = document.querySelector<HTMLDivElement>('#app')!
startWasiTask(app)



