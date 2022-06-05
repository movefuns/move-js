import { WasmFs } from '@wasmer/wasmfs'
import { Git } from "../pkg/git";
import { IMovePackage, MovePackage } from "../pkg/package";

describe("Package", () => {
  let wasmfs:WasmFs;
  let git:Git;

  beforeEach(async () => {
    wasmfs = new WasmFs();
    git = new Git(wasmfs);
  });

  it("create starcoin framework move package from path should be ok", async () => {
    await git.download("./base/test/data/starcoin-framework.zip", "/workspace/starcoin-framework");
 
    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/starcoin-framework", 
      test: false
    })

    expect(mp.name).toBe("StarcoinFramework")
    expect(mp.version).toBe("0.1.0")

    expect(mp.addresses.size).toBe(3)
    expect(mp.addresses.get("StarcoinFramework")).toBe("0x1")
    expect(mp.addresses.get("StarcoinAssociation")).toBe("0xA550C18")
    expect(mp.addresses.get("VMReserved")).toBe("0x0")

    expect(mp.devDependencies.size).toBe(1)
    expect(mp.devDependencies.get("UnitTest").local).toBe("./unit-test")
  });

  
  it("create my-counter move package from path should be ok", async () => {
    await git.download("./base/test/data/my-counter.zip", "/workspace/my-counter");
 
    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/my-counter", 
      test: false
    })

    expect(mp.name).toBe("my_counter")
    expect(mp.version).toBe("0.0.1")

    expect(mp.addresses.size).toBe(2)
    expect(mp.addresses.get("StarcoinFramework")).toBe("0x1")
    expect(mp.addresses.get("MyCounter")).toBe("0xABCDE")

    expect(mp.dependencies.size).toBe(1)
    expect(mp.dependencies.get("StarcoinFramework").git).toBe("https://github.com/starcoinorg/starcoin-framework.git")
    expect(mp.dependencies.get("StarcoinFramework").rev).toBe("cf1deda180af40a8b3e26c0c7b548c4c290cd7e7")
  });
 
  it("build starcoin unit-test package should be ok", async () => {
    await git.download("./base/test/data/unit-test.zip", "/workspace/unit-test");
 
    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/unit-test", 
      test: true
    })
    await mp.build()
  });

  
  it("build starcoin framework should be ok", async () => {
    await git.download("./base/test/data/starcoin-framework.zip", "/workspace/starcoin-framework");
 
    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/starcoin-framework", 
      test: false
    })

    await mp.build()

    const ntfExists = wasmfs.fs.existsSync("/workspace/starcoin-framework/target/starcoin/release/package.blob")
    expect(ntfExists).toBeTruthy()
  });

  
  it("build my-counter example package should be ok", async () => {
    await git.download("./base/test/data/starcoin-framework.zip", "/workspace/starcoin-framework");
    await git.download("./base/test/data/my-counter.zip", "/workspace/my-counter");
 
    let initAlias = new Map<string, string>()
    initAlias.set("StarcoinFramework", "/workspace/starcoin-framework")

    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/my-counter", 
      test: true,
      alias: initAlias
    })
    
    await mp.build()

    const ntfExists = wasmfs.fs.existsSync("/workspace/my-counter/target/starcoin/release/package.blob")
    expect(ntfExists).toBeTruthy()
  });

});