import { WasmFs } from '@wasmer/wasmfs'

describe("Demo", () => {
  let wasmfs:WasmFs;

  beforeEach(async () => {
    wasmfs = new WasmFs();
  });

  it("should have stdin, stdout, and stderr", async () => {
    expect(wasmfs.fs.existsSync("/dev/stdin")).toBe(true);
    expect(wasmfs.fs.existsSync("/dev/stdout")).toBe(true);
    expect(wasmfs.fs.existsSync("/dev/stderr")).toBe(true);
  });
  
  it("serializes properly directories", async () => {
    let fs = wasmfs.fs;
    try {
      fs.mkdirSync("/tmp");
    } catch (e) {}
    const jsonData = wasmfs.toJSON();

    // Create a new FS from the serialized JSON
    const newFs = new WasmFs();
    newFs.fromJSON(jsonData);

    var stat1 = wasmfs.fs.lstatSync("/tmp");
    var stat2 = newFs.fs.lstatSync("/tmp");
    expect(stat1.isDirectory()).toBeTruthy();
    expect(stat2.isDirectory()).toBeTruthy();
  });

});