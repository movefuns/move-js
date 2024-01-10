import { WasmFs } from '@wasmer/wasmfs'
import { Git } from "../pkg/git";
import { Move } from "../pkg/move";

describe("Move", () => {
  let wasmfs: WasmFs;
  let git: Git;

  beforeEach(async () => {
    wasmfs = new WasmFs();
    git = new Git(wasmfs);
  });

  it("cli build unit-test should be ok", async () => {
    await git.download("./base/test/data/framework.zip", "/workspace/framework");
    await git.download("./base/test/data/unit-test.zip", "/workspace/unit-test");

    let cli = new Move(wasmfs, {
      pwd: "/workspace/unit-test",
      preopens: ["/workspace"],
    })

    await cli.run(["--", "build", "--dependency_dirs", "/workspace/framework/move-stdlib",
      "--address_maps", "UnitTest:0xABCDE,std:0x1,core_resources:0xA550C18,vm_reserved:0x0,Extensions:0x1",
      "--test", "true"]
    )

    const unitTestExists = wasmfs.fs.existsSync("/workspace/unit-test/target/aptos/release/package.blob")
    expect(unitTestExists).toBeTruthy()
  });

  it("cli build AptosFramework should be ok", async () => {
    await git.download("./base/test/data/framework.zip", "/workspace/framework");

    let cli = new Move(wasmfs, {
      pwd: "/workspace/framework/aptos-framework",
      preopens: ["/workspace"]
    })

    await cli.run(["--", "build", "--dependency_dirs", "/workspace/framework/aptos-framework,/workspace/framework/aptos-stdlib,/workspace/framework/move-stdlib",
      "--address_maps", "std:0x1,aptos_std:0x1,aptos_framework:0x1,aptos_token:0x3,core_resources:0xA550C18,vm_reserved:0x0,Extensions:0x1"])

    const ntfExists = wasmfs.fs.existsSync("/workspace/framework/aptos-framework/target/aptos/release/package.blob")
    expect(ntfExists).toBeTruthy()
  });


  it("cli build my-counter example should be ok", async () => {
    await git.download("./base/test/data/framework.zip", "/workspace/framework");
    await git.download("./base/test/data/my-counter.zip", "/workspace/my-counter");

    let cli = new Move(wasmfs, {
      pwd: "/workspace/my-counter",
      preopens: ["/workspace"]
    })

    await cli.run(["--", "build", "--dependency_dirs", "/workspace/framework/aptos-framework,/workspace/framework/aptos-stdlib,/workspace/framework/move-stdlib",
      "--address_maps", "MyCounter:0xABCDE,std:0x1,aptos_std:0x1,aptos_framework:0x1,aptos_token:0x3,core_resources:0xA550C18,vm_reserved:0x0,Extensions:0x1",
      "--init_function", "0xABCDE::MyCounter::init"])

    const ntfExists = wasmfs.fs.existsSync("/workspace/my-counter/target/aptos/release/package.blob")
    expect(ntfExists).toBeTruthy()
  });

  it("cli disassemble should be ok", async () => {

    await git.download("./base/test/data/disassemble.zip", "/workspace/disassemble")

    let cli = new Move(wasmfs, {
      pwd: "/workspace/disassemble",
      preopens: ["/workspace"]
    })

    await cli.run(["--", "disassemble", "--file_path", "/workspace/disassemble/test"])

    const ntfExists = wasmfs.fs.existsSync("/workspace/disassemble/test.d")

    if (ntfExists) {
      wasmfs.fs.readFile("/workspace/disassemble/test.d", (_, v) => {
        console.log("disassemble success")
      })
    } else {
      wasmfs.fs.readFile("/workspace/disassemble/test.e", (_, v) => {
        console.log(v?.toString())
      })
    }

    expect(ntfExists).toBeTruthy()
  });

});
