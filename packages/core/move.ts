import { WasmFs } from '@wasmer/wasmfs'
import { Cli } from './cli'
import ErrorType from './errors'
import { IDownloader } from './downloader'
import { IMovePackage, MovePackage } from './package'
import { Utils } from './utils'
import { Result } from './result'
import { Downloader } from './downloader'

export interface IMove {
    /**
     * Create a new Move package with name `name` and target `target` at `path`.
     * If `path` is not provided the package will be created in the directory `name`
     * @param name Package name
     * @param target Starcoin|Aptos|Sui
     * @param path Package save path
     */
    newPackage(name: string, target: Target, path?: string): Promise<IMovePackage>

    /**
     * Load a Move Package at project path
     * @param path Package at project path
     * @param to Save Package path
     * If `to` is not provided the package will be created in the directory `/workspace/`name``
     * @param deps Package dependencies at project path
     */
    loadPackage(path: string, to?: string, deps?: string): Promise<IMovePackage>

    /**
     * Disassemble the Move bytecode pointed to
     * @param code bytecode
     */
    disassemble(target: Target, code: string): Promise<Result<string>>
}

export class Move implements IMove {

    protected wasmFs: WasmFs
    protected cli: Cli
    protected proxy: string
    private defaultPath: string

    constructor(proxy?: string) {
        this.cli = new Cli(new WasmFs())
        this.defaultPath = "/workspace/"
    }

    newPackage(name: string, target: Target, path?: string): Promise<IMovePackage> {
        throw new Error('Method not implemented.')
    }

    async loadPackage(path: string, to?: string, deps?: string): Promise<IMovePackage> {

        if (!Utils.supportPackageOrigin(path)) {
            throw ErrorType.NOT_SUPPORT_ORIGIN
        }

        let git = new Downloader(this.wasmFs, this.proxy)

        to = to ? to : this.defaultPath + Utils.resolveName(path)

        await git.download(path, to)

        if (deps) {
            await git.download(deps, to)
        }

        return new MovePackage(this.wasmFs, to, this.proxy, deps != undefined)
    }

    async disassemble(target: Target, code: string): Promise<Result<string>> {
        throw new Error()
    }
}


// 存储
// serveice
// rpc
// sdk
// cli
// 交易格式
// 