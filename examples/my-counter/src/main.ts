import './style.css'

import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage, DisassemblePackage } from '@starcoin/move-js'

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
  const base64Data = blobBuf.toString("base64")
  console.log("my-counter blob:", base64Data)

  const dp = new DisassemblePackage(wasmfs)

  const test = "a11ceb0b040000000901000402040403081905210c072d4e087b200a9b01050ca001510df101020000010100020c000003000100000402010000050001000006020100010800040001060c00010c010708000105094d79436f756e746572065369676e657207436f756e74657204696e63720c696e63725f636f756e74657204696e69740c696e69745f636f756e7465720576616c75650a616464726573735f6f66ddb608357d749031bbdb79c21db535950000000000000000000000000000000100020107030001000100030d0b0011042a000c010a01100014060100000000000000160b010f001502010200010001030e001100020201000001050b0006000000000000000012002d00020302000001030e00110202000000"

  await dp.disassemble("test", test, (ok: boolean, data: string) => {
    console.log("disassemble --------------------------------")
    console.log(ok)
    console.log(data)
  })

  app.innerHTML = `
      <h1>my-counter blob:</h1>
      ${base64Data}
      <h1>view disassemble in console:</h1>
    `
}

const app = document.querySelector<HTMLDivElement>('#app')!
startWasiTask(app)



