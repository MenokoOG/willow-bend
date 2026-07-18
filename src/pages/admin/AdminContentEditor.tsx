import { useEffect, useMemo, useState } from "react";
import { pageSchemas } from "../../data/pageSchemas";
import { usePageContent } from "../../hooks/index";
import {
  useLocalStorage,
  useStateWithHistory,
  useUpdateEffect,
} from "../../hooks";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function AdminContentEditor() {
  const pageIds = Object.keys(pageSchemas);

  const [selectedPage, setSelectedPage] = useLocalStorage<string>(
    "wbc_admin_page",
    pageIds[0]
  );

  const { data, loading, save } = usePageContent(selectedPage);

  const initialDraft = useMemo(
    () => (data ?? pageSchemas[selectedPage]) as Record<string, string>,
    [data, selectedPage]
  );

  const [draft, setDraft, history] =
    useStateWithHistory<Record<string, string>>(initialDraft);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMsg, setSaveMsg] = useState<string>("");

  useEffect(() => {
    if (!data) return;
    setDraft(data as Record<string, string>);
    setSaveState("idle");
    setSaveMsg("");
  }, [selectedPage, data]);

  const debouncedDraft = useDebounce(draft, 650);

  useUpdateEffect(() => {
    const run = async () => {
      try {
        setSaveState("saving");
        setSaveMsg("Saving…");
        await save(debouncedDraft);
        setSaveState("saved");
        setSaveMsg("Saved");
      } catch {
        setSaveState("error");
        setSaveMsg("Save failed. Check connection and try again.");
      }
    };

    if (!data) return;
    run();
  }, [debouncedDraft]);

  if (loading || !data) {
    return <div className="p-8">Loading content…</div>;
  }

  const setField = (key: string, value: string) => {
    setDraft({
      ...draft,
      [key]: value,
    });
  };

  const pillClass =
    saveState === "saved"
      ? "pill pill--approved"
      : saveState === "saving"
      ? "pill"
      : saveState === "error"
      ? "pill pill--canceled"
      : "pill pill--pending";

  return (
    <section className="space-y-6 max-w-3xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Edit Site Content</h1>
        <p className="text-[1.05rem]" style={{ color: "var(--muted)" }}>
          Changes autosave. Use Undo/Redo if you make a mistake.
        </p>
      </header>

      <div className="card p-6 sm:p-7 space-y-5">
        <div className="grid lg:grid-cols-3 gap-4 items-end">
          <div className="lg:col-span-2 space-y-2">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--muted)" }}
            >
              Select page
            </label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="input"
            >
              {pageIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 lg:justify-end">
            <button
              type="button"
              className="btn-ghost"
              onClick={history.back}
              disabled={history.pointer <= 0}
              aria-disabled={history.pointer <= 0}
            >
              Undo
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={history.forward}
              disabled={history.pointer >= history.history.length - 1}
              aria-disabled={history.pointer >= history.history.length - 1}
            >
              Redo
            </button>
          </div>
        </div>

        <div role="status" className={pillClass}>
          {saveMsg || "Ready"}
        </div>

        <div className="space-y-5">
          {Object.entries(draft).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label
                className="text-sm font-semibold"
                style={{ color: "var(--muted)" }}
              >
                {key}
              </label>
              <textarea
                className="input"
                value={value}
                onChange={(e) => setField(key, e.target.value)}
                rows={key.toLowerCase().includes("body") ? 7 : 4}
                style={{
                  fontFamily: key.toLowerCase().includes("body")
                    ? "inherit"
                    : "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  letterSpacing: "0.01em",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="btn-hero"
            onClick={async () => {
              try {
                setSaveState("saving");
                setSaveMsg("Saving…");
                await save(draft);
                setSaveState("saved");
                setSaveMsg("Saved");
              } catch {
                setSaveState("error");
                setSaveMsg("Save failed. Check connection and try again.");
              }
            }}
          >
            Save Now
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setDraft(data as Record<string, string>);
              setSaveState("idle");
              setSaveMsg("Reverted to last saved");
            }}
          >
            Revert
          </button>
        </div>
      </div>
    </section>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
