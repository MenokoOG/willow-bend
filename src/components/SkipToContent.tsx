export default function SkipToContent() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:px-4 focus:py-2"
      style={{
        background: "var(--primary)",
        color: "var(--on-primary)",
      }}
    >
      Skip to content
    </a>
  );
}
