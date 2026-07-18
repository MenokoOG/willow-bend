import { useState } from "react";

export default function useToggle(
  initialValue = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = () => setValue((v) => !v);
  const set = (v: boolean) => setValue(v);

  return [value, toggle, set];
}
