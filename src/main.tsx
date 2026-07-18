import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";

const App = lazy(() => import("./App"));
const AuthProvider = lazy(() =>
  import("./auth/AuthContext").then((mod) => ({ default: mod.AuthProvider }))
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="py-16 text-center">Loading…</div>}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
