// src/components/Layout.jsx
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${user ? 'pb-20 md:pb-8' : ''}`}>
        {children}
      </main>
      <Footer />
      {user && <MobileNav />}
    </div>
  );
};

export default Layout;