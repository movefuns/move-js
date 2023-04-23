export class MoveJSError extends Error {
    code:number

    constructor(code:number, message:string) {
        super(message)

        this.code = code

        Object.setPrototypeOf(this, MoveJSError.prototype)
    }
}

export default class ErrorType {
    public static readonly OK = new MoveJSError(10000, "OK")
    public static readonly NOT_SUPPORT_ORIGIN = new MoveJSError(10001, "Not support origin, current support [project data、git]")
    public static readonly DOWNLOAD_FAILED = new MoveJSError(10001, "Download failed")
    public static readonly DOWNLOAD_TIME_OUT = new MoveJSError(10002, "Download time out")
    public static readonly NO_PROXY = new MoveJSError(10003, "Configure the proxy first")
}