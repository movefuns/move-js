import { WasmFs } from '@wasmer/wasmfs'
import { CompileResult, Result } from './result'

export interface IDependency {
  git?: string
  rev?: string
  local?: string
}

export interface IMovePackage {
  name?: string
  version?: string
  addresses?: Map<string, string>
  dependencies?: Map<string, IDependency>
  devDependencies?: Map<string, IDependency>

  /**
   * Downloads a package and stores it in a directory named after the package
   * @param path package path
   */
  download(path: string, progressCallback?: (name: string, index: number, count: number) => void): Promise<boolean>

  /**
   * Compiles a package at `path`. If no path is provided defaults to current directory
   * @param path Path to a package which the command should be run with respect to
   * @param localDepsPath dependencies or dev-dependencies local path
   * @param abi Generate ABIs for packages
   * @param dev Compile in 'dev' mode. 
   * The 'dev-addresses' and 'dev-dependencies' fields will be used if this flag is set.
   * This flag is useful for development of packages that expose named addresses that are not set to a specific value
   * @param doc Generate documentation for packages
   * @param test Compile in 'test' mode. 
   * The 'dev-addresses' and 'dev-dependencies' fields will be used along with any code in the 'tests' directory
   * @param skipFetchLatestGitDeps Skip fetching latest git dependencies, Default true
   */
  compile(path?: string, localDepsPath?: string, abi?: boolean, dev?: boolean, doc?: boolean, test?: boolean, skipFetchLatestGitDeps?: boolean): Promise<Result<CompileResult>>

  /**
   * Disassemble the Move bytecode pointed to
   * @param code bytecode
   */
  disassemble(code: string): Result<string>

  /**
   * Run a Move function
   */
  run(code: string): Result<boolean>

  /**
   * Runs Move unit tests for a package
   * @param path Package path
   * @param filter A filter string to determine which unit tests to run
   */
  test(path: string, filter: string, instructions: number): Result<boolean>
}

export class MovePackage implements IMovePackage {
  public name?: string
  public version?: string
  public addresses?: Map<string, string>
  public devDependencies?: Map<string, IDependency>
  public dependencies?: Map<string, IDependency>
  private gitProxy: String
  private projectDeps: boolean
  private path:string

  private wasmfs: WasmFs

  constructor(wasmfs: WasmFs, path: string, gitProxy?: string, projectDeps?: boolean) {
    this.wasmfs = wasmfs
    this.path = path
    this.projectDeps = projectDeps
  }

  async download(path: string, progressCallback?: (name: string, index: number, count: number) => void): Promise<boolean> {
    if (this.projectDeps) {
      return true
    }
  }

  compile(path?: string, localDepsPath?: string, abi?: boolean, dev?: boolean, doc?: boolean, test?: boolean, skipFetchLatestGitDeps?: boolean): Promise<Result<CompileResult>> {
    this.download(path)
    throw new Error('Method not implemented.')
  }

  disassemble(code: string): Result<string> {
    throw new Error('Method not implemented.')
  }

  run(code: string): Result<boolean> {
    throw new Error('Method not implemented.')
  }

  test(path: string, filter: string, instructions: number): Result<boolean> {
    throw new Error('Method not implemented.')
  }
}