export interface Success<T> {
  data: T;
  error: null;
}

export interface Failure<E> {
  data: null;
  error: E;
}

export type FuncResult<T, E = Error> = Success<T> | Failure<E>;
