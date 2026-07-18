import { useState } from "react";
import { useToggle } from "../hooks";

interface Props {
  value: string;
  onSave: (value: string) => void;
  isAdmin: boolean;
}

export default function EditableBlock({ value, onSave, isAdmin }: Props) {
  const [editing, toggle] = useToggle(false);
  const [draft, setDraft] = useState(value);

  if (!isAdmin) return <>{value}</>;

  return (
    <div className="space-y-2">
      {editing ? (
        <>
          <textarea
            className="w-full p-2 rounded bg-black/20 border border-white/20"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-hero"
              onClick={() => {
                onSave(draft);
                toggle();
              }}
            >
              Save
            </button>
            <button type="button" className="btn-hero" onClick={toggle}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div onDoubleClick={toggle} className="cursor-pointer">
          {value}
        </div>
      )}
    </div>
  );
}
