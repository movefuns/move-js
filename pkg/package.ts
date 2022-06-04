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
  private test: boolean

  constructor(wasmfs:WasmFs, packagePath:string, test: boolean, alias?:Map<string, string>) {
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
    this.test = test
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
    let deps = this.getAllDeps()
    let addresses = this.getAllAddresses()

    await this.buildPackage(this.wasmfs, this.packagePath, deps, addresses)
  }

  public getAllDeps(): Array<string> {
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

          let mp = new MovePackage(this.wasmfs, aliasPath, false)
          let deps = mp.getAllDeps();
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

          let mp = new MovePackage(this.wasmfs, depPath, false)
          let deps = mp.getAllDeps();
          if (deps) {
            deps.forEach(function(dep: string){
              allDeps.push(dep)
            });
          }
        } 
      })
    }
  }

  public getAllAddresses(): Map<string, string> {
    let allAddresses = new Map<string, string>();

    this.addresses.forEach(function(val:string, key:string){
      allAddresses.set(key, val)
    })

    this.collectAddresses(allAddresses, this.dependencies)
    this.collectAddresses(allAddresses, this.devDependencies)

    return allAddresses
  }

  collectAddresses(allAddresss: Map<string, string>, modules: Map<string, IDependency>) {
    let packageAlias = this.packageAlias
    
    if (modules) {
      modules.forEach((dep: IDependency, key: string) => {
        let aliasPath = packageAlias.get(key)

        if (aliasPath != null) {
          let mp = new MovePackage(this.wasmfs, aliasPath, false)
          let addresses = mp.getAllAddresses();
          if (addresses) {
            addresses.forEach(function(val:string, key:string){
              allAddresss.set(key, val)
            });
          }
  
          return
        }
  
        if (dep.local) {
          let depPath = path.join(this.packagePath, dep.local)
          let mp = new MovePackage(this.wasmfs, depPath, false)
          let addresses = mp.getAllAddresses();
          if (addresses) {
            addresses.forEach(function(val:string, key:string){
              allAddresss.set(key, val)
            });
          }
        } 
      })
    }
  }

  async buildPackage(wasmfs:WasmFs, packagePath:string, deps: Array<string>, addresses: Map<string, string>): Promise<void> {
    console.log("Building ", this.name)
  
    let cli = new Move(wasmfs, {
        pwd: packagePath,
        preopens: ["/workspace"]
    })
  
    let dep_dirs = deps.join(",")
    let address_maps = new Array<string>()
    addresses.forEach(function(val:string, key:string){
      address_maps.push(key + ":" + val)
    })
    let address_args = address_maps.join(",")

    console.log("build deps:", dep_dirs)
    console.log("build addresses:", address_args)
    console.log("is test:", this.test)

    await cli.run(["--dependency_dirs", dep_dirs, "--address_maps", address_args, "--test", String(this.test)])
  }
}




