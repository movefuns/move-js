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

  it("get AptosFramework package from path should be ok", async () => {
    await git.download("./base/test/data/framework.zip", "/workspace/framework");

    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/framework/aptos-framework",
      test: false
    })

    expect(mp.name).toBe("AptosFramework")
    expect(mp.version).toBe("1.0.0")
  });


  it("get my-counter package from path should be ok", async () => {
    await git.download("./base/test/data/my-counter.zip", "/workspace/my-counter");

    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/my-counter",
      test: false
    })

    expect(mp.name).toBe("my_counter")
    expect(mp.version).toBe("0.0.1")
  });

  it("get unit-test package should be ok", async () => {
    await git.download("./base/test/data/unit-test.zip", "/workspace/unit-test");

    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/unit-test",
      test: true
    })

    expect(mp.name).toBe("unit_test")
    expect(mp.version).toBe("0.1.0")
  });

  it("build framework should be ok", async () => {
    await git.download("./base/test/data/framework.zip", "/workspace/framework");

    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/framework/aptos-framework",
      test: false
    })

    await mp.build()

    const ntfExists = wasmfs.fs.existsSync("/workspace/framework/aptos-framework/target/aptos/release/package.blob")
    expect(ntfExists).toBeTruthy()
  });


  it("build my-counter example package should be ok", async () => {
    await git.download("./base/test/data/framework.zip", "/workspace/framework");
    await git.download("./base/test/data/my-counter.zip", "/workspace/my-counter");

    let initAlias = new Map<string, string>()
    initAlias.set("AptosFramework", "/workspace/framework/aptos-framework")

    let mp = new MovePackage(wasmfs, {
      packagePath: "/workspace/my-counter",
      test: true,
      alias: initAlias,
      initFunction: "0xABCDE::MyCounter::init"
    })

    await mp.build()

    const ntfExists = wasmfs.fs.existsSync("/workspace/my-counter/target/aptos/release/package.blob")

    const hash = wasmfs.fs.existsSync("/workspace/my-counter/target/aptos/release/hash.txt")

    if (hash) {
      wasmfs.fs.readFile("/workspace/my-counter/target/aptos/release/hash.txt", (_, v) => {
        console.log(v?.toString())
      })
    }

    console.log(hash)

    expect(ntfExists).toBeTruthy()
  });
});
