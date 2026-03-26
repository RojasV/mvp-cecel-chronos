export class Result<T, E> {
  private constructor(
    private readonly _value: T | undefined,
    private readonly _error: E | undefined,
    private readonly _isOk: boolean,
  ) {}

  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(value, undefined, true);
  }

  static err<E, T = never>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error, false);
  }

  isOk(): this is Result<T, never> {
    return this._isOk;
  }

  isErr(): this is Result<never, E> {
    return !this._isOk;
  }

  get value(): T {
    if (!this._isOk) {
      throw new Error("Cannot access value of an error result");
    }
    return this._value as T;
  }

  get error(): E {
    if (this._isOk) {
      throw new Error("Cannot access error of a success result");
    }
    return this._error as E;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isOk) {
      return Result.ok(fn(this._value as T));
    }
    return Result.err(this._error as E);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    if (!this._isOk) {
      return Result.err(fn(this._error as E));
    }
    return Result.ok(this._value as T);
  }

  unwrapOr(defaultValue: T): T {
    return this._isOk ? (this._value as T) : defaultValue;
  }
}
