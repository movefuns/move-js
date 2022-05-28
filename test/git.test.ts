import { WasmFs } from '@wasmer/wasmfs'
import { Git } from "../pkg/git";

describe("Git", () => {
  let git:Git;
  let wasmfs:WasmFs;

  beforeEach(async () => {
    wasmfs = new WasmFs();
    git = new Git(wasmfs);
  });

  it("download zip file should be ok", async () => {
    await git.download("./base/test/data/my-counter.zip", "/tmp/guide-to-move-package-manager/my-counter");
    const moveTomlText = wasmfs.fs.readFileSync("/tmp/guide-to-move-package-manager/my-counter/Move.toml", "utf8")
    expect(moveTomlText).toContain("name = \"my_counter\"")

    const MyCounterText = wasmfs.fs.readFileSync("/tmp/guide-to-move-package-manager/my-counter/sources/MyCounter.move", "utf8")
    expect(MyCounterText).toContain("struct Counter has key, store")
  });
});