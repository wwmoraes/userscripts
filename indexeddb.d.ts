interface IDBEventTarget<T> extends EventTarget {
  result?: T;
}

interface IDBEvent<T> extends Event {
  target: IDBEventTarget<T> | null;
}


interface IDBCursorWithKnownValue<T> extends IDBCursor {
  /**
   * Returns the cursor's current value.
   */
  readonly value: T;
}
