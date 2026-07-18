import { Outlet } from "react-router-dom";
import Header from "../ui/Header";
import Footer from "../ui/Footer";
import ChatWidget from "../components/ChatWidget";
import SkipToContent from "../components/SkipToContent";

export default function SiteLayout() {
  return (
    // IMPORTANT: no hard-coded bg/text classes — CSS variables drive theme
    <div className="min-h-screen">
      <SkipToContent />
      <Header />

      <main
        id="main"
        className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10"
      >
        <Outlet />
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
