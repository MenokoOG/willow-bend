import { NavLink, Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../auth/AuthContext";

const baseLink =
  "px-3 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2";
const active = "bg-white/10";
const inactive = "hover:bg-white/5";

function navClass(isActive: boolean) {
  return [
    baseLink,
    isActive ? active : inactive,
    // Use CSS variables for text; do NOT hardcode text-white
    "text-[color:var(--text)]",
    "focus-visible:ring-[color:var(--ring)]",
  ].join(" ");
}

export default function Header() {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--bg) 78%, transparent)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-xl grid place-items-center"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
            aria-hidden
          >
            <span className="text-sm font-bold">WB</span>
          </div>

          <div className="leading-tight">
            <div className="text-sm font-semibold text-[color:var(--text)]">
              Willow Bend Family Clinic
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              Meridian, ID
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
            Home
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) => navClass(isActive)}
          >
            Services
          </NavLink>
          <NavLink
            to="/testimonials"
            className={({ isActive }) => navClass(isActive)}
          >
            Testimonials
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => navClass(isActive)}
          >
            Contact
          </NavLink>
          <NavLink
            to="/request"
            className={({ isActive }) => navClass(isActive)}
          >
            Request Appointment
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!user ? (
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="btn-hero text-sm px-4 py-2"
            >
              Login
            </Link>
          ) : (
            <>
              {role === "admin" ? (
                <Link to="/admin" className="btn-hero text-sm px-4 py-2">
                  Admin
                </Link>
              ) : (
                <Link to="/patient" className="btn-hero text-sm px-4 py-2">
                  Portal
                </Link>
              )}

              <button onClick={logout} className="btn-ghost text-sm px-3 py-2">
                Log out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div
        style={{ borderTop: "1px solid var(--border)" }}
        className="md:hidden"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap gap-2">
          <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
            Home
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) => navClass(isActive)}
          >
            Services
          </NavLink>
          <NavLink
            to="/testimonials"
            className={({ isActive }) => navClass(isActive)}
          >
            Testimonials
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => navClass(isActive)}
          >
            Contact
          </NavLink>
          <NavLink
            to="/request"
            className={({ isActive }) => navClass(isActive)}
          >
            Appointment
          </NavLink>
        </div>
      </div>
    </header>
  );
}
