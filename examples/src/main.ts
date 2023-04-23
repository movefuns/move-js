import './style.css'

import { MoveJS } from '@starcoin/move-js'

const startDisassembleTask = async (app: HTMLDivElement) => {
  // https://github.com/aptos-labs/aptos-core/archive/7508c38b8f86575451a6b6505bd15ddbd58c7140.zip
  // const  axios = new Axios()
  // axios.post("https://github.com/aptos-labs/aptos-core/archive/7508c38b8f86575451a6b6505bd15ddbd58c7140.zip").then(o => {
  //   console.log(o)
  // })

  // const wasmfs = new WasmFs()

  let moveJS = MoveJS.create(Aptos)

  try {
    let movePackage = await moveJS.loadPackage
  } catch (e) {
    console.log((e as Error).message)
  }

  // (await MoveJS.create().loadPackage("")).code

  // const dp = new Disassemble(wasmfs)

  // //Chain code
  // //0x1::Account::AccountScripts
  // const account_scripts = "0xa11ceb0b040000000601000403040f051307071a60087a100c8a011800000001000200010000030001000104020100010c0002060c010e4163636f756e7453637269707473074163636f756e741964697361626c655f6175746f5f6163636570745f746f6b656e18656e61626c655f6175746f5f6163636570745f746f6b656e157365745f6175746f5f6163636570745f746f6b656e000000000000000000000000000000010002000001040e00091102020102000001040e000811020200"

  // dp.disassemble("account_scripts", account_scripts, (ok: boolean, data: string) => {
  //   console.log(ok)
  //   console.log(data)
  // })

  app.innerHTML = `
      <h1>view disassemble in console:</h1>
    `
}

const app = document.querySelector<HTMLDivElement>('#app')!
startDisassembleTask(app)



