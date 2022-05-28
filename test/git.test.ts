import { WasmFs } from '@wasmer/wasmfs'
import { Git } from "../pkg/git";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000

describe("Git", () => {
  let git:Git;
  let wasmfs:WasmFs;

  beforeEach(async () => {
    wasmfs = new WasmFs();
    git = new Git(wasmfs);
  });

  it("download my-counter source zipshould be ok", async () => {
    await git.download("./base/test/data/my-counter.zip", "/workspace/guide-to-move-package-manager/my-counter");
    const moveTomlText = wasmfs.fs.readFileSync("/workspace/guide-to-move-package-manager/my-counter/Move.toml", "utf8")
    expect(moveTomlText).toContain("name = \"my_counter\"")

    const MyCounterText = wasmfs.fs.readFileSync("/workspace/guide-to-move-package-manager/my-counter/sources/MyCounter.move", "utf8")
    expect(MyCounterText).toContain("struct Counter has key, store")
  });

  it("download starcoin-framework source zip should be ok", async () => {
    await git.download("./base/test/data/starcoin-framework.zip", "/workspace/starcoin-framework");

    const MyCounterText = wasmfs.fs.readFileSync("/workspace/starcoin-framework/sources/Token.move", "utf8")
    expect(MyCounterText).toContain("struct Token<phantom TokenType> has store")
  });

});