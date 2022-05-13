/**
 * This error gets thrown if an error in a reducer function occurs because the action isn't compatible to the state.
 */
// TODO: This comment is now outdated.
// Because the Error class is environment specific, extending built ins can make trouble when transpiling
// and we don't need a stack trace, we don't extend the Error class.
export class ReducerError {
    public readonly name = 'ReducerError';

    public readonly stack?: string;

    constructor(public readonly message: string) {
        // eslint-disable-next-line unicorn/error-message
        this.stack = new Error().stack;
    }
}
