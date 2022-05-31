import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage } from 'move-js'

const startWasiTask = async () => {
    let wasmfs = new WasmFs()
    let git = new Git(wasmfs)

    await git.download("/data/starcoin-framework.zip", "/workspace/starcoin-framework")
    await git.download("/data/my-counter.zip", "/workspace/my-counter")

    let initAlias = new Map()
    initAlias.set("StarcoinFramework", "/workspace/starcoin-framework")
    let mp = new MovePackage(wasmfs, "/workspace/my-counter", initAlias)
    await mp.build()
}

startWasiTask()