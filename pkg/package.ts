import { WasmFs } from '@wasmer/wasmfs'
import * as path from 'path'
import * as TOML from '@iarna/toml'

export interface IDependencyInfo {
  git?:string
  rev?:string
  local?:string
}

export interface IMovePackage {
  name?:string
  version?:string
  addresses?:Map<string, string>
  dependencies?:Map<string, IDependencyInfo>
  devDependencies?:Map<string, IDependencyInfo>
  install(): void
  build():void
}

export class MovePackage implements IMovePackage {
  public name?:string
  public version?:string
  public addresses?:Map<string, string>
  public devDependencies?:Map<string, IDependencyInfo>
  public dependencies?:Map<string, IDependencyInfo>

  constructor(wasmfs:WasmFs, packagePath:string) {
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
    this.devDependencies = new Map<string, IDependencyInfo>()
    this.parseDeps(this.devDependencies, toml["dev-dependencies"])
    
    // dev dependenciesd
    this.dependencies = new Map<string, IDependencyInfo>()
    this.parseDeps(this.dependencies, toml["dependencies"])
  }

  parseDeps(thisDeps:Map<string, IDependencyInfo>, tomlDeps:any):void {
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
  
  install(): void {
    throw new Error('Method not implemented.')
  }

  build(): void {
    throw new Error('Method not implemented.')
  }
}