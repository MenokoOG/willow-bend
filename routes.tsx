import { Navigate } from "react-router-dom";
import ProtectedRoute from "./src/auth/ProtectedRoute";

import Home from "./src/pages/public/Home";
import Services from "./src/pages/public/Services";
import Testimonials from "./src/pages/public/Testimonials";
import Contact from "./src/pages/public/Contact";
import RequestAppointment from "./src/pages/public/RequestAppointment";

import AdminDashboard from "./src/pages/admin/AdminDashboard";
import AdminAppointments from "./src/pages/admin/AdminAppointments";
import AdminContentEditor from "./src/pages/admin/AdminContentEditor";
import PatientCalendar from "./src/pages/patient/PatientCalendar";

export const routes = [
  { path: "/", element: <Navigate to="/home" /> },

  { path: "/home", element: <Home /> },
  { path: "/services", element: <Services /> },
  { path: "/testimonials", element: <Testimonials /> },
  { path: "/contact", element: <Contact /> },
  { path: "/request", element: <RequestAppointment /> },

  {
    path: "/admin",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/content",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <AdminContentEditor />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/appointments",
    element: (
      <ProtectedRoute allow={["admin"]}>
        <AdminAppointments />
      </ProtectedRoute>
    ),
  },

  {
    path: "/patient/calendar",
    element: (
      <ProtectedRoute allow={["user", "admin"]}>
        <PatientCalendar />
      </ProtectedRoute>
    ),
  },
];
