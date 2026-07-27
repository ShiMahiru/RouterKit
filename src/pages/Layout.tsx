import { Outlet } from 'react-router';
import NavBar from '@/components/NavBar';
import SiteFooter from '@/components/SiteFooter';
import BackToTop from '@/components/BackToTop';

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
