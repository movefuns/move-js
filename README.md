# move-js

Javascript version of the move language compiler and disassemble

## Features
- Compiling move package into blob
- Disassemble contract

## Example

* Compiling move package into blob example
```ts
import { WasmFs } from '@wasmer/wasmfs'
import { Git, MovePackage } from '@aptos-labs/move-js'

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
```

* Disassemble contract example
```ts
import { WasmFs } from '@wasmer/wasmfs'
import { Disassemble } from '@aptos-labs/move-js'

const startDisassembleTask = async (app: HTMLDivElement) => {
  const wasmfs = new WasmFs()

  const dp = new Disassemble(wasmfs)

  //Chain code
  const account_scripts = "your code"

  dp.disassemble("account_scripts", account_scripts, (ok: boolean, data: string) => {
    app.innerHTML = `
      <h1>disassemble status: ${ok}</h1>
      <h1>disassembled code:</h1>
      ${data}
    `
  })
}

const app = document.querySelector<HTMLDivElement>('#app')!
startDisassembleTask(app)
```

## Supported Rust Versions

`@aptos-labs/move-js` supports the version of Rust (toolchain and targets) specified
in [`rust-toolchain.toml`](rust-toolchain.toml). At the time of writing, we are
using version 1.77.0. However, this can change at any time if one of our
dependencies changes MSRV or through a new patch version.

## Building from source

Note: You will need rust installed also for this. https://www.rust-lang.org/tools/install or

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then get `@aptos-labs/move-js` source:

```
git clone https://github.com/movefuns/move-js
cd move-js
git checkout aptos
```

Build the source

```
yarn install
yarn build
```

## Testing

### Build and test the example program

[my-counter](/examples/my-counter/) (Compiling move package into blob)

```
cd example/my-counter/
yarn install
yarn dev
```

[disassemble](/examples/disassemble/) (Disassemble contract from bytecode)

```
cd example/disassemble
yarn install
yarn dev
```

### Unit test

```
yarn test
```

## License

Licensed under the Apache License, Version 2.0,
see the [LICENSE](LICENSE) file for more information.
