import { WasmFs } from '@wasmer/wasmfs'
import { Git } from "../pkg/git";
import { MovePackage, } from "../pkg/package";
import { Disassemble } from "../pkg/disassemble";

describe("Package", () => {
  let wasmfs: WasmFs;
  let git: Git;

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
      alias: initAlias,
      initFunction: "0xABCDE::MyCounter::init"
    })

    await mp.build()

    const ntfExists = wasmfs.fs.existsSync("/workspace/my-counter/target/starcoin/release/package.blob")
    expect(ntfExists).toBeTruthy()
  });

  it("build disassemble example package should be ok", async () => {

    let mp = new Disassemble(wasmfs)

    const test = "a11ceb0b040000000901000402040403081905210c072d4e087b200a9b01050ca001510df101020000010100020c000003000100000402010000050001000006020100010800040001060c00010c010708000105094d79436f756e746572065369676e657207436f756e74657204696e63720c696e63725f636f756e74657204696e69740c696e69745f636f756e7465720576616c75650a616464726573735f6f66ddb608357d749031bbdb79c21db535950000000000000000000000000000000100020107030001000100030d0b0011042a000c010a01100014060100000000000000160b010f001502010200010001030e001100020201000001050b0006000000000000000012002d00020302000001030e00110202000000"

    await mp.disassemble("test", test, (ok: boolean, data: string) => {
      console.log(ok + " " + data)
    })

    const ntfExists = wasmfs.fs.existsSync("/workspace/disassemble/test.d")
    expect(ntfExists).toBeTruthy()
  });

});