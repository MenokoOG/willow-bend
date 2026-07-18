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
      <div className="card p-6">
        <h1 className="text-xl font-semibold text-theme">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted">
          You do not have permission to access this page.
        </p>

        {from && (
          <p className="mt-2 text-sm text-muted2">
            Requested route: <span className="text-muted">{from}</span>
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
