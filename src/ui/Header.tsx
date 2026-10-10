import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../auth/AuthContext";
import { VoxelSvg } from "../graphics/VoxelArt";
import { logoCube } from "../graphics/scenes";

const baseLink =
  "px-3 py-2 text-sm font-bold border-2 transition focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]";

function navClass(isActive: boolean) {
  return [
    baseLink,
    isActive
      ? "bg-[color:var(--yellow)] text-[#16324a] border-[color:var(--line)]"
      : "border-transparent text-[color:var(--ink2)] hover:bg-[color:var(--sage-tint)] hover:border-[color:var(--line)] hover:text-[color:var(--ink)]",
  ].join(" ");
}

const LOGO_CUBE = logoCube();

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <VoxelSvg
      grid={LOGO_CUBE}
      unit={8}
      style={{ height: size, width: size }}
    />
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
      className="sticky top-0 z-40"
      style={{
        borderBottom: "4px solid var(--line)",
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
              style={{ color: "var(--link)" }}
            >
              Patient login
            </Link>
          ) : (
            <>
              {role === "admin" ? (
                <Link
                  to="/admin"
                  className="hidden sm:inline-block text-sm font-semibold px-2"
                  style={{ color: "var(--link)" }}
                >
                  Admin
                </Link>
              ) : (
                <Link
                  to="/patient"
                  className="hidden sm:inline-block text-sm font-semibold px-2"
                  style={{ color: "var(--link)" }}
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
          style={{ borderTop: "3px solid var(--line)" }}
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
