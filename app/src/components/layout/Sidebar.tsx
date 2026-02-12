import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Box,
  Image,
  Video,
  Sparkles,
  Store,
  Lightbulb,
  GraduationCap,
  Users,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Navigation items
const navItems = [
  { icon: Home, label: 'Home', path: '/', active: true },
  { icon: Box, label: 'Models', path: '/models' },
  { icon: Image, label: 'AI Image', path: '/generate/image' },
  { icon: Video, label: 'AI Video', path: '/generate/video' },
  { icon: Sparkles, label: 'Workflow', path: '/workflow' },
];

const secondaryNav = [
  { icon: Store, label: 'Events', path: '/events' },
  { icon: Lightbulb, label: 'Inspiration', path: '/inspiration' },
  { icon: ShoppingCart, label: 'AI Shops', path: '/shops' },
  { icon: GraduationCap, label: 'Creator Academy', path: '/academy' },
  { icon: Users, label: 'Profile', path: '/profile' },
  { icon: FileText, label: 'Documentation', path: '/docs' },
];

// Need to import ShoppingCart separately as it was missing in the list above but used in secondaryNav
import { ShoppingCart } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 w-60 h-full bg-[#0D0F0E] border-r border-white/5 z-50 flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <img
          src="/new logo.png"
          alt="Nyxel Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="text-lg font-bold text-white">Nyxel</span>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* Primary Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/generate/image' && location.pathname === '/generate') ||
              (item.path === '/generate/image' && location.pathname.startsWith('/generate/image')) ||
              (item.path === '/generate/video' && location.pathname.startsWith('/generate/video'));

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${isActive
                  ? 'bg-white/5 text-white border-l-2 border-emerald-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400'}`} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-white/5" />

        {/* Secondary Navigation */}
        <nav className="space-y-1">
          {secondaryNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${isActive
                  ? 'bg-white/5 text-white border-l-2 border-emerald-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* More Button */}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 w-full mt-2">
          <MoreHorizontal className="w-4 h-4" />
          <span>More</span>
        </button>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium">User</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
        <div className="flex gap-2 text-gray-500">
          <a href="#" className="text-xs hover:text-emerald-400 transition-colors">Privacy</a>
          <span className="text-xs">·</span>
          <a href="#" className="text-xs hover:text-emerald-400 transition-colors">Terms</a>
        </div>
      </div>
    </aside>
  );
}
