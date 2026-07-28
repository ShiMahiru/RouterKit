import { Outlet } from "react-router";
import NavBar from "@/components/layout/NavBar";
import SiteFooter from "@/components/layout/SiteFooter";
import BackToTop from "@/components/layout/BackToTop";

export default function Layout() {
  return (
    <>
      <NavBar />
      <Outlet />
      <SiteFooter />
      <BackToTop />
    </>
  );
}
