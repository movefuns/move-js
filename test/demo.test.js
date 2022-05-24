import { WasmFs } from '@wasmer/wasmfs'

describe("A suite is just a function", function() {
    var a;

    it("and so is a spec", function() {
      let fs = new WasmFs();
      expect(a).toBe(true);
    });
});