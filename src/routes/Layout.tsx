import { Outlet } from 'react-router';
import { siteConfig } from '../config';
import NavBar from '$lib/components/NavBar';
import SiteFooter from '$lib/components/SiteFooter';
import BackToTop from '$lib/components/BackToTop';
import '../app.css';

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
