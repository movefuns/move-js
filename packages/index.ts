import { MoveJSError } from './core/errors'
import { IMove, Move } from './core/move'

export { MoveJSError }

export class MoveJS {
    public static create(): IMove {
        return new Move()
    }
}
