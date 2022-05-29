import { WasmFs } from '@wasmer/wasmfs'
import * as path from 'path'
import * as TOML from '@iarna/toml'

export interface IDependency {
  git?:string
  rev?:string
  local?:string
}

export interface IMovePackage {
  name?:string
  version?:string
  addresses?:Map<string, string>
  dependencies?:Map<string, IDependency>
  devDependencies?:Map<string, IDependency>

  build():void
}

export class MovePackage implements IMovePackage {
  public name?:string
  public version?:string
  public addresses?:Map<string, string>
  public devDependencies?:Map<string, IDependency>
  public dependencies?:Map<string, IDependency>

  private wasmfs:WasmFs
  private packagePath: string

  constructor(wasmfs:WasmFs, packagePath:string) {
    this.wasmfs = wasmfs
    this.packagePath = packagePath

    let tomlPath = path.join(packagePath, "Move.toml")
    let tomlContent = wasmfs.fs.readFileSync(tomlPath, "utf-8")
    this.parseToml(tomlContent.toString())
  }

  parseToml(tomlContent: string):void {
    let toml = TOML.parse(tomlContent)

    // @ts-ignore
    this.name = toml["package"]["name"] as string

    // @ts-ignore
    this.version = toml["package"]["version"] as string

    this.addresses = new Map<string, string>();

    // @ts-ignore
    for (let key in toml["addresses"]) 
    {
      // @ts-ignore
      this.addresses.set(key, toml["addresses"][key])
    }

    // dev dependencies
    this.devDependencies = new Map<string, IDependency>()
    this.parseDeps(this.devDependencies, toml["dev-dependencies"])
    
    // dev dependenciesd
    this.dependencies = new Map<string, IDependency>()
    this.parseDeps(this.dependencies, toml["dependencies"])
  }

  parseDeps(thisDeps:Map<string, IDependency>, tomlDeps:any):void {
    // @ts-ignore
    for (let key in tomlDeps) {
      // @ts-ignore
      let dep = tomlDeps[key]

      if (dep != null) {
        let depInfo = {
          git: dep["git"],
          rev: dep["rev"],
          local: dep["local"]
        }

        thisDeps.set(key, depInfo)
      }
    }
  }

  build(): void {
    this.buildDependencies(this.dependencies)
    this.buildDependencies(this.devDependencies)
    this.buildCurrent()
  }

  buildDependencies(deps: Map<string, IDependency>) {
    if (deps) {
      deps.forEach((value: IDependency, key: string, map: Map<string, IDependency>) => {
        let dep = deps.get(key)

        if (dep.local) {
          let depPath = path.join(this.packagePath, dep.local)
          let mp = new MovePackage(this.wasmfs, depPath)
          mp.build()
        }
      })
    }
  }

  buildCurrent() {
    console.log("Building ", this.name)
  }
}