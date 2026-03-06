// src/components/MobileNav.jsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../stores/chatStore';

const MobileNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useChat();

  const isActive = (path) => pathname === path;

  if (!user) return null; // Only show for logged-in users

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/post-ad', icon: PlusCircle, label: 'Post' },
    { to: '/chat', icon: MessageCircle, label: 'Chat', badge: unreadCount },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-2 px-2 md:hidden z-50 safe-bottom">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex flex-col items-center p-2 min-w-[44px] min-h-[44px] rounded-lg ${
            isActive(item.to) ? 'text-primary' : 'text-text-light'
          }`}
        >
          <div className="relative">
            <item.icon size={22} />
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileNav;