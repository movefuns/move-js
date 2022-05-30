import { WasmFs, Git, MovePackage } from 'move-js'

// Async function to run our WASI module/instance
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

// Everything starts here
startWasiTask()