import { NavLink } from 'react-router-dom';
import { Heart, MessageCircle, User, Settings, Compass } from 'lucide-react';

const navItems = [
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: '/matches', icon: Heart, label: 'Matches' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
    <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-pink-500 bg-pink-50'
                : 'text-gray-400 hover:text-pink-400'
            }`
          }
        >
          <Icon size={22} />
          <span className="text-xs font-medium">{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);
