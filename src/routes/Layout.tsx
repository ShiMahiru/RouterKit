import { Outlet } from 'react-router';
import NavBar from '$lib/components/NavBar';
import SiteFooter from '$lib/components/SiteFooter';
import BackToTop from '$lib/components/BackToTop';

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
