import { WasmFs } from '@wasmer/wasmfs'
import * as zip from '@zip.js/zip.js'
import * as path from 'path'
import ErrorType from './errors'

/**
 * IDownloader interface
 */
export interface IDownloader {
    /**
     * Download code to dest path
     *
     * @param repoUrl
     * @param destPath
     */
    download(repoUrl: string, destPath: string): Promise<void>
}

/**
 * Downloader
 */
export class Downloader implements IDownloader {
    private wasmfs?: WasmFs
    private proxy?: string

    constructor(wasmfs: WasmFs, proxy?: String) {
        this.wasmfs = wasmfs
    }

    async download(zipURL: string, destPath: string): Promise<void> {
        if (zipURL.startsWith("https:://")) {
            if (!this.proxy) {
                throw ErrorType.NO_PROXY
            }
        } else {
            const binary = await getBinaryFromUrl(zipURL)
            this.wasmfs.fs.mkdirpSync(destPath)

            const zipReader = new zip.ZipReader(new zip.Uint8ArrayReader(binary))

            try {
                const entries = await zipReader.getEntries()

                for (const entry of entries) {
                    if (entry.directory) {
                        const newDest = path.join(destPath, entry.filename)
                        this.wasmfs.fs.mkdirpSync(newDest)
                    } else {
                        const destEntry = path.join(destPath, entry.filename)
                        const data = await entry.getData(new zip.Uint8ArrayWriter())
                        this.wasmfs.fs.writeFileSync(destEntry, data)
                    }
                }
            } finally {
                await zipReader.close()
            }
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
