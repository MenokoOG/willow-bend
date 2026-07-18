import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../auth/AuthContext";

const baseLink =
  "px-3 py-2 rounded-xl text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]";

function navClass(isActive: boolean) {
  return [
    baseLink,
    isActive
      ? "bg-[color:var(--sage-tint)] text-[color:var(--ink)]"
      : "text-[color:var(--ink2)] hover:bg-[color:var(--sage-tint)] hover:text-[color:var(--ink)]",
  ].join(" ");
}

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="logo-mark"
      style={{ height: size, width: size }}
      aria-hidden
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 21c-4-2.5-7-5.8-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.2-3 7.5-7 10Z" />
      </svg>
    </div>
  );
}

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/services", label: "Services" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        borderBottom: "1px solid var(--line)",
        background: "var(--header-bg)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={closeMenu}>
          <LogoMark />
          <div className="leading-tight">
            <div className="font-display text-[15px] font-bold text-[color:var(--ink)]">
              Willow Bend
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              Family Clinic
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => navClass(isActive)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!user ? (
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="hidden sm:inline-block text-sm font-semibold px-2"
              style={{ color: "var(--primary)" }}
            >
              Patient login
            </Link>
          ) : (
            <>
              {role === "admin" ? (
                <Link
                  to="/admin"
                  className="hidden sm:inline-block text-sm font-semibold px-2"
                  style={{ color: "var(--primary)" }}
                >
                  Admin
                </Link>
              ) : (
                <Link
                  to="/patient"
                  className="hidden sm:inline-block text-sm font-semibold px-2"
                  style={{ color: "var(--primary)" }}
                >
                  Portal
                </Link>
              )}
              <button
                onClick={logout}
                className="hidden sm:inline-flex btn-ghost text-sm !px-4 !py-2"
              >
                Log out
              </button>
            </>
          )}

          <Link to="/request" className="btn-hero text-sm !px-4 !py-2">
            Book a visit
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="icon-btn md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav
          aria-label="Mobile"
          className="md:hidden"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => navClass(isActive)}
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/request"
              className={({ isActive }) => navClass(isActive)}
              onClick={closeMenu}
            >
              Request Appointment
            </NavLink>

            {!user ? (
              <NavLink
                to="/login"
                state={{ from: location.pathname }}
                className={({ isActive }) => navClass(isActive)}
                onClick={closeMenu}
              >
                Patient login
              </NavLink>
            ) : (
              <>
                <NavLink
                  to={role === "admin" ? "/admin" : "/patient"}
                  className={({ isActive }) => navClass(isActive)}
                  onClick={closeMenu}
                >
                  {role === "admin" ? "Admin" : "Portal"}
                </NavLink>
                <button
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className={`${baseLink} text-left text-[color:var(--ink2)] hover:bg-[color:var(--sage-tint)]`}
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
