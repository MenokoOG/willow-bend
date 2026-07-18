import { Outlet } from "react-router-dom";
import Header from "../ui/Header";
import Footer from "../ui/Footer";
import ChatWidget from "../components/ChatWidget";

export default function SiteLayout() {
  return (
    // IMPORTANT: remove hard-coded bg/text classes so CSS variables can drive theme
    <div className="min-h-screen">
      <Header />
      

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
