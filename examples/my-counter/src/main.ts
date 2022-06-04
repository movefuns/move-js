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

    app.innerHTML = `
      <h1>Hello Vite!</h1>
      <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
    `
}

const app = document.querySelector<HTMLDivElement>('#app')!
startWasiTask(app)



