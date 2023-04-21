# move-js

Based on [Movewasm](https://github.com/movefuns/move-wasm)

Javascript version of the move language tools

## Features

| Features    | Starcoin | Aptos |  Sui |
| :---------- | :------: | :---: | ---: |
| newPackage  |    N     |   N   |    N |
| loadPackage |    N     |   N   |    N |
| download    |    N     |   N   |    N |
| compile     |    N     |   N   |    N |
| disassemble |    N     |   N   |    N |
| run         |    N     |   N   |    N |
| test        |    N     |   N   |    N |

## Different interfaces

## Example 
```ts
import { MoveJS } from '@starcoin/move-js'

const main = async () => {
  let moveJS = MoveJS.cre
  
  try {
    let movePackage = await moveJS.loadPackage("")
    movePackage.compile()
  } catch(e) {
    console.log((e as Error).message)
  }
}
```