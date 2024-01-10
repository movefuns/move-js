import { WasmFs } from '@wasmer/wasmfs'
import { Git } from "../pkg/git";

describe("Git", () => {
  let git:Git;
  let wasmfs:WasmFs;

  beforeEach(async () => {
    wasmfs = new WasmFs();
    git = new Git(wasmfs);
  });

  it("download my-counter source zip should be ok", async () => {
    await git.download("./base/test/data/my-counter.zip", "/workspace/guide-to-move-package-manager/my-counter");
    const moveTomlText = wasmfs.fs.readFileSync("/workspace/guide-to-move-package-manager/my-counter/Move.toml", "utf8")
    expect(moveTomlText).toContain("name = \"my_counter\"")

    const MyCounterText = wasmfs.fs.readFileSync("/workspace/guide-to-move-package-manager/my-counter/sources/MyCounter.move", "utf8")
    expect(MyCounterText).toContain("struct Counter has key, store")
  });

  it("download framework source zip should be ok", async () => {
    await git.download("./base/test/data/framework.zip", "/workspace/framework");

    const TokenText = wasmfs.fs.readFileSync("/workspace/framework/aptos-token/sources/token.move", "utf8")
    expect(TokenText).toContain("struct Token has store")
  });
});
