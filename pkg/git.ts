import { WasmFs } from '@wasmer/wasmfs'
import * as zip from "@zip.js/zip.js";
import * as path from 'path'

/**
 * Git repo interface
 */
export interface IRepo {
  type: string,
  origin: string,
  owner: string,
  name: string,
  checkout: string
}

/**
 * Git interface
 */
export interface IGit {
  /**
   * Download code to dest path
   * 
   * @param repoUrl 
   * @param destPath 
   */
  download(repoUrl: string, destPath: string): Promise<void>
}

/**
 * Git
 * 
 */
export class Git implements IGit {
  public wasmfs?: WasmFs

  constructor(wasmfs: WasmFs) {
    this.wasmfs = wasmfs
  }

  async download(zipURL: string, destPath: string): Promise<void> {
    let binary = await getBinaryFromUrl(zipURL)
    console.log("zip length: ", binary.length)

    this.wasmfs.fs.mkdirpSync(destPath);
    
    const zipReader = new zip.ZipReader(new zip.Uint8ArrayReader(binary));

    try {
      const entries = await zipReader.getEntries();

      for (let i=0; i<entries.length; i++) {
        const entry = entries[i]

        if (entry.directory) {
          const newDest = path.join(destPath, entry.filename)
          this.wasmfs.fs.mkdirpSync(newDest);
        } else {
          const destEntry = path.join(destPath, entry.filename)
          const data = await entry.getData(new zip.Uint8ArrayWriter());
          this.wasmfs.fs.writeFileSync(destEntry, data);
        }
      }
    } finally {
	    await zipReader.close();
    }
  }
}

/**
 * Get binary from URL
 *
 * @param {String} url
 * @return {Uint8Array}
 */
async function getBinaryFromUrl(url: string): Promise<Uint8Array> {
  const fetched = await fetch(url)
  const buffer = await fetched.arrayBuffer()
  return new Uint8Array(buffer)
}
