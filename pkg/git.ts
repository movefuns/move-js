import { WasmFs } from '@wasmer/wasmfs'
import { extractContents } from "@wasmer/wasmfs/lib/tar";

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
  download(repoUrl: string, destPath: string): Promise<boolean>
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

  async download(zipURL: string, destPath: string): Promise<boolean> {
    let binary = await getBinaryFromUrl(zipURL)

    this.wasmfs.fs.mkdirpSync(destPath);
    
    // We extract the contents on the desired directory
    await extractContents(this.wasmfs, binary, destPath);

    return true
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

/**
 * Normalize a repo string.
 *
 * @param {String} repo
 * @return {Object}
 */
function normalize(repo: string): IRepo {
  var regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/
  var match = regex.exec(repo)

  if (match) {
    throw new Error("Not a repo url")
  }

  regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^/]+)\/([^#]+)(?:#(.+))?$/
  match = regex.exec(repo)
  if (match == null) {
    throw new Error("match is null")
  }

  var type = match[1] || 'github'
  var origin = match[2] || ""
  var owner = match[3]
  var name = match[4]
  var checkout = match[5] || 'master'

  if (origin == "") {
    if (type === 'github') {
      origin = 'github.com'
    } else if (type === 'gitlab') {
      origin = 'gitlab.com'
    } else if (type === 'bitbucket') {
      origin = 'bitbucket.org'
    }
  }

  return {
    type: type,
    origin: origin,
    owner: owner,
    name: name,
    checkout: checkout
  }
}


/**
 * Adds protocol to url in none specified
 *
 * @param {String} url
 * @return {String}
 */
function addProtocol(origin: string, clone: boolean): string {
  if (!/^(f|ht)tps?:\/\//i.test(origin)) {
    if (clone) {
      origin = 'git@' + origin
    } else {
      origin = 'https://' + origin
    }
  }

  return origin
}

/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @return {String}
 */
function getUrl(repo: IRepo, clone: boolean): string {
  var url = "";

  // Get origin with protocol and add trailing slash or colon (for ssh)
  var origin = addProtocol(repo.origin, clone)
  if (/^git@/i.test(origin)) {
    origin = origin + ':'
  } else {
    origin = origin + '/'
  }

  // Build url
  if (clone) {
    url = origin + repo.owner + '/' + repo.name + '.git'
  } else {
    if (repo.type === 'github') {
      url =
        origin +
        repo.owner +
        '/' +
        repo.name +
        '/archive/' +
        repo.checkout +
        '.zip'
    } else if (repo.type === 'gitlab') {
      url =
        origin +
        repo.owner +
        '/' +
        repo.name +
        '/repository/archive.zip?ref=' +
        repo.checkout
    } else if (repo.type === 'bitbucket') {
      url =
        origin + repo.owner + '/' + repo.name + '/get/' + repo.checkout + '.zip'
    }
  }

  return url
}
