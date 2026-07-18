import { useState } from "react";

export interface UseArrayActions<T> {
  set: (value: T[]) => void;
  push: (value: T) => void;
  remove: (index: number) => void;
  filter: (callback: (value: T, index: number) => boolean) => void;
  update: (index: number, newValue: T) => void;
  clear: () => void;
}

export default function useArray<T>(initial: T[]): [T[], UseArrayActions<T>] {
  const [array, setArray] = useState<T[]>(initial);

  const actions: UseArrayActions<T> = {
    set: setArray,
    push: (value) => setArray((a) => [...a, value]),
    remove: (index) => setArray((a) => a.filter((_, i) => i !== index)),
    filter: (callback) => setArray((a) => a.filter(callback)),
    update: (index, newValue) =>
      setArray((a) => a.map((v, i) => (i === index ? newValue : v))),
    clear: () => setArray([]),
  };

  return [array, actions];
}
