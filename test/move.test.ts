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

  it("run build unit-test should be ok", async () => {
    await git.download("./base/test/data/unit-test.zip", "/workspace/unit-test");

    let cli = new Move(wasmfs, {
      pwd: "/workspace/unit-test"
    })

    await cli.run(["--", "build", "--address_maps", "Std:0x1", "--test", "true"])

    const unitTestExists = wasmfs.fs.existsSync("/workspace/unit-test/target/starcoin/release/package.blob")
    expect(unitTestExists).toBeTruthy()
  });

  it("run build starcoin-framework should be ok", async () => {
    await git.download("./base/test/data/starcoin-framework.zip", "/workspace/starcoin-framework");

    let cli = new Move(wasmfs, {
      pwd: "/workspace/starcoin-framework"
    })

    await cli.run(["--", "build", "--dependency_dirs", "/workspace/starcoin-framework/unit-test", "--address_maps", "StarcoinFramework:0x1,StarcoinAssociation:0xA550C18,VMReserved:0x0,Std:0x1"])

    const ntfExists = wasmfs.fs.existsSync("/workspace/starcoin-framework/target/starcoin/release/package.blob")
    expect(ntfExists).toBeTruthy()
  });


  it("run build my-counter example should be ok", async () => {
    await git.download("./base/test/data/starcoin-framework.zip", "/workspace/starcoin-framework");
    await git.download("./base/test/data/my-counter.zip", "/workspace/my-counter");

    let cli = new Move(wasmfs, {
      pwd: "/workspace/my-counter",
      preopens: ["/workspace"]
    })

    await cli.run(["--", "build", "--dependency_dirs", "/workspace/starcoin-framework,/workspace/starcoin-framework/unit-test",
      "--address_maps", "StarcoinFramework:0x1,MyCounter:0xABCDE,StarcoinAssociation:0xA550C18,VMReserved:0x0,Std:0x1",
      "--init_function", "0xABCDE::MyCounter::init"])

    const ntfExists = wasmfs.fs.existsSync("/workspace/my-counter/target/starcoin/release/package.blob")
    expect(ntfExists).toBeTruthy()
  });

  it("run disassemble should be ok", async () => {

    let cli = new Move(wasmfs)

    let bytecode = "a11ceb0b040000000901000402040403081905210c072d4e087b200a9b01050ca001510df101020000010100020c000003000100000402010000050001000006020100010800040001060c00010c010708000105094d79436f756e746572065369676e657207436f756e74657204696e63720c696e63725f636f756e74657204696e69740c696e69745f636f756e7465720576616c75650a616464726573735f6f66ddb608357d749031bbdb79c21db535950000000000000000000000000000000100020107030001000100030d0b0011042a000c010a01100014060100000000000000160b010f001502010200010001030e001100020201000001050b0006000000000000000012002d00020302000001030e00110202000000"

    let s = await cli.run(["--", "disassemble", "--bytecode", bytecode])

    console.log(s)

    expect(true).toBeTruthy()
  });

});