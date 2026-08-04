import { Outlet, useLocation } from "react-router";
import NavBar from "@/components/layout/NavBar";
import SiteFooter from "@/components/layout/SiteFooter";
import BackToTop from "@/components/layout/BackToTop";

export default function Layout() {
  const { pathname } = useLocation();
  const isThoughts = pathname === "/thoughts" || pathname === "/thoughts/";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      {!isThoughts && <SiteFooter />}
      <BackToTop />
    </div>
  );
}
