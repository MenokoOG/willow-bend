import { useAuth } from "../../auth/AuthContext";
import { usePageContent } from "../../hooks/index";
import EditableBlock from "../../cms/EditableBlock";

export default function Testimonials() {
  const { role } = useAuth();
  const { data, loading, save } = usePageContent("testimonials");

  if (loading || !data) return <div className="p-8">Loading…</div>;

  return (
    <section className="p-10 grid gap-6">
      <blockquote className="italic">
        “
        <EditableBlock
          value={data.quote1}
          isAdmin={role === "admin"}
          onSave={(v) => save({ quote1: v })}
        />
        ”
      </blockquote>

      <blockquote className="italic">
        “
        <EditableBlock
          value={data.quote2}
          isAdmin={role === "admin"}
          onSave={(v) => save({ quote2: v })}
        />
        ”
      </blockquote>
    </section>
  );
}
