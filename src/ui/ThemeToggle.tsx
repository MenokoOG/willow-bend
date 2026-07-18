import { useEffect } from "react";
import { useLocalStorage } from "../hooks/index";

type Theme = "dark" | "light";

function setThemeColorMeta(theme: Theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute("content", theme === "light" ? "#F7F8FB" : "#0B0E13");
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  setThemeColorMeta(theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<Theme>("wbc_theme", "dark");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="btn-ghost text-sm px-3 py-2"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle light/dark theme"
      title="Toggle theme"
    >
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}