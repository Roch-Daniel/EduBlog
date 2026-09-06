import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "../navigation/ScrollToTop";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_#e8fff8,_#f5f7fb_45%)] text-slate-800">
      <ScrollToTop />
      <Header />
      <main className="flex grow flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
