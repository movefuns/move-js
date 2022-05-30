import * as path from 'path'
import * as TOML from '@iarna/toml'
import { WasmFs } from '@wasmer/wasmfs'
import { Move } from "../pkg/move";


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
  private packageAlias: Map<string, string>

  constructor(wasmfs:WasmFs, packagePath:string, alias?:Map<string, string>) {
    this.wasmfs = wasmfs
    this.packagePath = packagePath

    let tomlPath = path.join(packagePath, "Move.toml")
    let tomlContent = wasmfs.fs.readFileSync(tomlPath, "utf-8")
    this.parseToml(tomlContent.toString())

    let packageAlias = new Map<string, string>();
    if (alias != null) {
      alias.forEach(function(val: string, key: string){
        packageAlias.set(key, val);
      });
    }

    this.packageAlias = packageAlias
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

  public async build(): Promise<void> {
    let deps = this.getDeps()
    console.log("build deps:", deps)
    await this.buildPackage(this.wasmfs, this.packagePath, deps)
  }

  public getDeps(): Array<string> {
    let deps = new Array<string>();

    this.collectDependencies(deps, this.dependencies)
    this.collectDependencies(deps, this.devDependencies)
    
    return deps
  }

  collectDependencies(allDeps: Array<string>, modules: Map<string, IDependency>) {
    let packageAlias = this.packageAlias
    
    if (modules) {
      modules.forEach((dep: IDependency, key: string) => {
        let aliasPath = packageAlias.get(key)

        if (aliasPath != null) {
          allDeps.push(aliasPath)

          let mp = new MovePackage(this.wasmfs, aliasPath)
          let deps = mp.getDeps();
          if (deps) {
            deps.forEach(function(dep: string){
              allDeps.push(dep)
            });
          }
  
          return
        }
  
        if (dep.local) {
          let depPath = path.join(this.packagePath, dep.local)
          allDeps.push(depPath)

          let mp = new MovePackage(this.wasmfs, depPath)
          let deps = mp.getDeps();
          if (deps) {
            deps.forEach(function(dep: string){
              allDeps.push(dep)
            });
          }
        } 
      })
    }
  }

  async buildPackage(wasmfs:WasmFs, packagePath:string, deps: Array<string>): Promise<void> {
    console.log("Building ", this.name)
  
    let cli = new Move(wasmfs, {
        pwd: packagePath,
        preopens: ["/workspace"]
    })
  
    let dep_dirs = deps.join(",")
    await cli.run(["--install_dir", "build", "--dependency_dirs", dep_dirs])
  }
}




