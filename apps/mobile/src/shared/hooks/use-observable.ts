import { useState, useEffect, useRef } from "react";
import type { Observable } from "rxjs";

export function useObservable<T>(observable: Observable<T>, initialValue: T): T {
  const [value, setValue] = useState<T>(initialValue);
  const valueRef = useRef(value);

  useEffect(() => {
    const subscription = observable.subscribe((next) => {
      valueRef.current = next;
      setValue(next);
    });

    return () => subscription.unsubscribe();
  }, [observable]);

  return value;
}
