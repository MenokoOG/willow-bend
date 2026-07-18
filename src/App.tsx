import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "./layout/SiteLayout";

import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";

const Home = lazy(() => import("./pages/public/Home"));
const Services = lazy(() => import("./pages/public/Services"));
const Testimonials = lazy(() => import("./pages/public/Testimonials"));
const Contact = lazy(() => import("./pages/public/Contact"));
const RequestAppointment = lazy(() => import("./pages/public/RequestAppointment"));

const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminContentEditor = lazy(() => import("./pages/admin/AdminContentEditor"));
const AdminAppointments = lazy(() => import("./pages/admin/AdminAppointments"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));

const PatientDashboard = lazy(() => import("./pages/patient/PatientDashboard"));
const PatientCalendar = lazy(() => import("./pages/patient/PatientCalendar"));

const HelpBot = lazy(() => import("./pages/shared/HelpBot"));

export default function App() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted">Loading…</div>}>
      <Routes>
        <Route element={<SiteLayout />}>
          {/* Public */}
          <Route index element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/request" element={<RequestAppointment />} />

          {/* Help bot (public) */}
          <Route path="/help" element={<HelpBot />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Patient */}
          <Route
            path="/patient"
            element={
              <RequireAuth>
                <PatientDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/patient/calendar"
            element={
              <RequireAuth>
                <PatientCalendar />
              </RequireAuth>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireRole role="admin">
                  <AdminDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/content"
            element={
              <RequireAuth>
                <RequireRole role="admin">
                  <AdminContentEditor />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <RequireAuth>
                <RequireRole role="admin">
                  <AdminAppointments />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <RequireAuth>
                <RequireRole role="admin">
                  <AdminMessages />
                </RequireRole>
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}