import { Outlet, useLocation } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import SiteFooter from "@/components/layout/SiteFooter";
import BackToTop from "@/components/layout/BackToTop";
import Analytics from "@/components/common/Analytics";

/** Routes that should not display the site footer. */
const NO_FOOTER_PATHS = new Set(["/thoughts", "/thoughts/"]);

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Analytics />
      <NavBar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      {!NO_FOOTER_PATHS.has(pathname) && <SiteFooter />}
      <BackToTop />
    </div>
  );
}
