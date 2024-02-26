import './style.css'

import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage } from '@movefuns/move-js'

const startWasiTask = async (app: HTMLDivElement) => {
  const wasmfs = new WasmFs()
  const git = new Git(wasmfs)

  await git.download("/data/framework.zip", "/workspace/framework")
  await git.download("/data/my-counter.zip", "/workspace/my-counter")

  const mp = new MovePackage(wasmfs, {
    packagePath: "/workspace/my-counter",
    test: false,
    alias: new Map([
      ["AptosFramework", "/workspace/framework/aptos-framework"]
    ]),
    initFunction: "0xABCDE::MyCounter::init"
  })

  await mp.build()

  const blobBuf = wasmfs.fs.readFileSync("/workspace/my-counter/target/aptos/release/package.blob")
  const hash = wasmfs.fs.readFileSync("/workspace/my-counter/target/aptos/release/hash.txt")
  const base64Data = blobBuf.toString("base64")

  // get hex of blob buf with 0x prefix
  const hex = blobBuf.toString("hex").replace(/^/, "0x")

  app.innerHTML = `
      <h1>my-counter blob:</h1>
      <dl>
        <dt>Hex:</dt><dd>${hex}</dd>
        <dt>Buffer:</dt><dd>${blobBuf}</dd>
        <dt>Base64:</dt><dd>${base64Data}</dd>
        <dt>Hash:</dt><dd>${hash}</dd>
      </dl>
    `
}

const app = document.querySelector<HTMLDivElement>('#app')!
startWasiTask(app)
