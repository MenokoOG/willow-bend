import { Link, useLocation } from "react-router-dom";
import usePageMeta from "../../seo/usePageMeta";

export default function Unauthorized() {
  usePageMeta({
    title: "Unauthorized • Willow Bend Family Clinic",
    description: "You do not have permission to view this page.",
    noIndex: true,
  });

  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-white">Unauthorized</h1>
        <p className="mt-2 text-sm text-white/70">
          You do not have permission to access this page.
        </p>

        {from && (
          <p className="mt-2 text-sm text-white/60">
            Requested route: <span className="text-white/80">{from}</span>
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/" className="btn-ghost px-4 py-2 text-sm">
            Go home
          </Link>
          <Link to="/login" className="btn-primary px-4 py-2 text-sm">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
