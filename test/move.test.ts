import { WasmFs } from '@wasmer/wasmfs'
import { Git } from "../pkg/git";
import { Move } from "../pkg/move";

describe("Move", () => {
  let wasmfs:WasmFs;
  let git:Git;

  beforeEach(async () => {
    wasmfs = new WasmFs();
    git = new Git(wasmfs);
  });

  /*
  it("run build unit-test should be ok", async () => {
    await git.download("./base/test/data/unit-test.zip", "/workspace/unit-test");
 
    let cli = new Move(wasmfs, {
        pwd: "/workspace/unit-test"
    })

    await cli.run(["--install_dir", "/workspace/unit-test/build"])

    const unitTestExists = wasmfs.fs.existsSync("/workspace/starcoin-framework/build/UnitTest.mv")
    expect(unitTestExists).toBeTruthy()

  });
  */
 
  it("run build starcoin-framework should be ok", async () => {
    await git.download("./base/test/data/starcoin-framework.zip", "/workspace/starcoin-framework");
 
    let cli = new Move(wasmfs, {
        pwd: "/workspace/starcoin-framework"
    })
    
    await cli.run(["--install_dir", "/workspace/starcoin-framework/build"])

    const ntfExists = wasmfs.fs.existsSync("/workspace/starcoin-framework/build/NFT.mv")
    expect(ntfExists).toBeTruthy()
  });

});