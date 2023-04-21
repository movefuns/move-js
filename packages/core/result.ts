export class Result<T> {
    code: number
    message: string
    data: T

}

export class CompileResult {
    buffer: string
    hash: string
}