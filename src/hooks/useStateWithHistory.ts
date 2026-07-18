import { useRef, useState } from "react";

export interface HistoryControls<T> {
  back: () => void;
  forward: () => void;
  go: (index: number) => void;
  history: T[];
  pointer: number;
}

export default function useStateWithHistory<T>(
  initialValue: T
): [T, (v: T) => void, HistoryControls<T>] {
  const [value, setValue] = useState<T>(initialValue);
  const historyRef = useRef<T[]>([initialValue]);
  const pointerRef = useRef(0);

  const set = (v: T) => {
    const history = historyRef.current.slice(0, pointerRef.current + 1);
    history.push(v);
    historyRef.current = history;
    pointerRef.current = history.length - 1;
    setValue(v);
  };

  const back = () => {
    if (pointerRef.current <= 0) return;
    pointerRef.current--;
    setValue(historyRef.current[pointerRef.current]);
  };

  const forward = () => {
    if (pointerRef.current >= historyRef.current.length - 1) return;
    pointerRef.current++;
    setValue(historyRef.current[pointerRef.current]);
  };

  const go = (index: number) => {
    if (index < 0 || index >= historyRef.current.length) return;
    pointerRef.current = index;
    setValue(historyRef.current[index]);
  };

  return [
    value,
    set,
    {
      back,
      forward,
      go,
      history: historyRef.current,
      pointer: pointerRef.current,
    },
  ];
}
