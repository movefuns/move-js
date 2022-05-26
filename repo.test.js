import { WasmFs } from '@wasmer/wasmfs'
import { Git } from "../pkg/git.ts";

describe("Git", () => {
  let git;
  let fs;

  beforeEach(async () => {
    fs = new WasmFs();
    git = new Git(fs);
  });

  it("download github repo should be ok", async () => {
    let ret = await git.download("https://github.com/yubing744/guide-to-move-package-manager.git", "/tmp/guide-to-move-package-manager");
    expect(ret).toBeTruthy();
  });
});