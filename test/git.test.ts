import { WasmFs } from '@wasmer/wasmfs'
import { Git } from "../pkg/git";

describe("Git", () => {
  let git:Git;
  let fs:WasmFs;

  beforeEach(async () => {
    fs = new WasmFs();
    git = new Git(fs);
  });

  it("download github repo should be ok", async () => {
    let ret = await git.download("./test/data/my-counter.zip", "/tmp/guide-to-move-package-manager");
    expect(ret).toBeTruthy();
  });
});