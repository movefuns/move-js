import { WasmFs } from '@wasmer/wasmfs'
import { Move } from '../pkg/move'

export interface IDisassemble {
    disassemble(
        name: string,
        bytecode: string,
        callback: (ok: boolean, data: string) => void
    ): Promise<void>
}

export class Disassemble implements IDisassemble {
    private wasmfs: WasmFs

    constructor(wasmfs: WasmFs) {
        this.wasmfs = wasmfs
    }

    public async disassemble(
        name: string,
        bytecode: string,
        callback: (ok: boolean, data: string) => void
    ): Promise<void> {
        const root = '/workspace/disassemble/'
        this.wasmfs.fs.mkdirpSync(root)

        const codePath = root + name
        this.wasmfs.fs.writeFileSync(codePath, bytecode)

        const cli = new Move(this.wasmfs, {
            pwd: '/workspace/disassemble/',
            preopens: ['/workspace'],
        })

        await cli.run(['--', 'disassemble', '--file_path', codePath])

        const ntfExists = this.wasmfs.fs.existsSync(codePath + '.d')

        if (ntfExists) {
            await this.wasmfs.fs.readFile(codePath + '.d', (_, v) =>
                callback(true, v?.toString())
            )
        } else {
            await this.wasmfs.fs.readFile(codePath + '.e', (_, v) =>
                callback(false, v?.toString())
            )
        }
    }
}
