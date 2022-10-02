import * as path from 'path'
import * as TOML from '@iarna/toml'
import { WasmFs } from '@wasmer/wasmfs'
import { Move } from '../pkg/move'

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

  build(): void
}

export type MoveOptions = {
  packagePath: string
  test: boolean
  alias?: Map<string, string>
  initFunction?: string
}

export class MovePackage implements IMovePackage {
  public name?: string
  public version?: string
  public addresses?: Map<string, string>
  public devDependencies?: Map<string, IDependency>
  public dependencies?: Map<string, IDependency>

  private wasmfs: WasmFs
  private packagePath: string
  private packageAlias: Map<string, string>
  private test: boolean
  private initFunction?: string

  constructor(wasmfs: WasmFs, opts: MoveOptions) {
    this.wasmfs = wasmfs
    this.packagePath = opts.packagePath

    const tomlPath = path.join(opts.packagePath, 'Move.toml')
    const tomlContent = wasmfs.fs.readFileSync(tomlPath, 'utf-8')
    this.parseToml(tomlContent.toString())

    const packageAlias = new Map<string, string>()
    if (opts.alias != null) {
      opts.alias.forEach((val: string, key: string) => {
        packageAlias.set(key, val)
      })
    }

    this.packageAlias = packageAlias
    this.test = opts.test
    this.initFunction = opts.initFunction
  }

  parseToml(tomlContent: string): void {
    const toml = TOML.parse(tomlContent)

    // @ts-ignore
    this.name = toml['package']['name'] as string

    // @ts-ignore
    this.version = toml['package']['version'] as string

    this.addresses = new Map<string, string>()

    // @ts-ignore
    for (const key in toml['addresses']) {
      if (toml['addresses'].hasOwnProperty(key)) {
        // @ts-ignore
        this.addresses.set(key, toml['addresses'][key])
      }
    }

    // dev dependencies
    this.devDependencies = new Map<string, IDependency>()
    this.parseDeps(this.devDependencies, toml['dev-dependencies'])

    // dev dependenciesd
    this.dependencies = new Map<string, IDependency>()
    this.parseDeps(this.dependencies, toml['dependencies'])
  }

  parseDeps(thisDeps: Map<string, IDependency>, tomlDeps: any): void {
    // @ts-ignore
    for (const key in tomlDeps) {
      if (!tomlDeps.hasOwnProperty(key)) {
        continue
      }

      // @ts-ignore
      const dep = tomlDeps[key]

      if (dep != null) {
        const depInfo = {
          git: dep['git'],
          rev: dep['rev'],
          local: dep['local'],
        }

        thisDeps.set(key, depInfo)
      }
    }
  }

  public async build(): Promise<void> {
    const deps = this.getAllDeps()
    const addresses = this.getAllAddresses()

    await this.buildPackage(this.wasmfs, this.packagePath, deps, addresses)
  }

  public getAllDeps(): string[] {
    const deps = new Array<string>()

    this.collectDependencies(deps, this.dependencies)
    this.collectDependencies(deps, this.devDependencies)

    return deps
  }

  collectDependencies(allDeps: string[], modules: Map<string, IDependency>) {
    const packageAlias = this.packageAlias

    if (modules) {
      modules.forEach((dep: IDependency, key: string) => {
        const aliasPath = packageAlias.get(key)

        if (aliasPath != null) {
          allDeps.push(aliasPath)

          new MovePackage(this.wasmfs, {
            packagePath: aliasPath,
            test: false,
          })
            .getAllDeps()
            .forEach((depName: string) => {
              allDeps.push(depName)
            })

          return
        }

        if (dep.local) {
          const depPath = path.join(this.packagePath, dep.local)
          allDeps.push(depPath)

          new MovePackage(this.wasmfs, {
            packagePath: depPath,
            test: false,
          })
            .getAllDeps()
            .forEach((depName: string) => {
              allDeps.push(depName)
            })
        }
      })
    }
  }

  public getAllAddresses(): Map<string, string> {
    const allAddresses = new Map<string, string>()

    this.addresses.forEach((val: string, key: string) => {
      allAddresses.set(key, val)
    })

    this.collectAddresses(allAddresses, this.dependencies)
    this.collectAddresses(allAddresses, this.devDependencies)

    return allAddresses
  }

  collectAddresses(
    allAddresss: Map<string, string>,
    modules: Map<string, IDependency>
  ) {
    const packageAlias = this.packageAlias

    if (modules) {
      modules.forEach((dep: IDependency, key: string) => {
        const aliasPath = packageAlias.get(key)

        if (aliasPath != null) {
          const mp = new MovePackage(this.wasmfs, {
            packagePath: aliasPath,
            test: false,
          })
          const addresses = mp.getAllAddresses()
          if (addresses) {
            addresses.forEach((addr: string, name: string) => {
              allAddresss.set(name, addr)
            })
          }

          return
        }

        if (dep.local) {
          const depPath = path.join(this.packagePath, dep.local)
          const mp = new MovePackage(this.wasmfs, {
            packagePath: depPath,
            test: false,
          })

          const addresses = mp.getAllAddresses()
          if (addresses) {
            addresses.forEach((addr: string, name: string) => {
              allAddresss.set(name, addr)
            })
          }
        }
      })
    }
  }

  async buildPackage(
    wasmfs: WasmFs,
    packagePath: string,
    deps: string[],
    addresses: Map<string, string>
  ): Promise<void> {
    console.log('Building ', this.name)

    const cli = new Move(wasmfs, {
      pwd: packagePath,
      preopens: ['/workspace'],
    })

    const depDirs = deps.join(',')
    const addressMaps = new Array<string>()
    addresses.forEach((val: string, key: string) => {
      addressMaps.push(key + ':' + val)
    })
    const addressArgs = addressMaps.join(',')

    let initFunction = ''
    if (this.initFunction) {
      initFunction = this.initFunction
    }

    console.log('build deps:', depDirs)
    console.log('build addresses:', addressArgs)
    console.log('is test:', this.test)
    console.log('initFunction:', initFunction)

    await cli.run([
      '--',
      'build',
      '--dependency_dirs',
      depDirs,
      '--address_maps',
      addressArgs,
      '--test',
      String(this.test),
      '--init_function',
      initFunction,
    ])
  }
}
