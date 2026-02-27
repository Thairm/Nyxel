import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Box,
  Image,
  Sparkles,
  Store,
  Lightbulb,
  GraduationCap,
  Users,
  FileText,
  MoreHorizontal,
  ShoppingCart,
  LogIn,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth, getUserDisplayInfo } from '@/hooks/useAuth';
import { usePromoStatus } from '@/hooks/useAuth';

// Navigation items
const navItems = [
  { icon: Home, label: 'Home', path: '/', active: true },
  { icon: Box, label: 'Models', path: '/models' },
  { icon: Image, label: 'AI Image', path: '/generate/image' },
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

// Map tier IDs to display names
const tierDisplayNames: Record<string, string> = {
  starter: 'Starter Plan',
  standard: 'Standard Plan',
  pro: 'Pro Plan',
  ultra: 'Ultra Plan',
};

// Map tier IDs to text colors
const tierColors: Record<string, string> = {
  free: 'text-gray-400',
  starter: 'text-orange-400',
  standard: 'text-blue-400',
  pro: 'text-emerald-400',
  ultra: 'text-purple-400',
};

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier } = usePromoStatus();
  const { displayName, avatarUrl, initial } = getUserDisplayInfo(user);

  const planLabel = currentTier ? tierDisplayNames[currentTier] || 'Paid Plan' : 'Free Plan';
  const planColor = tierColors[currentTier ?? 'free'] ?? 'text-gray-400';

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
              (item.path === '/generate/image' && location.pathname.startsWith('/generate/image'));

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
        {user ? (
          <>
            <div
              className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-white/5 rounded-lg p-1.5 -m-1.5 transition-colors"
              onClick={() => navigate('/profile')}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {initial}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{displayName}</p>
                <p className={`text-xs font-medium ${planColor}`}>{planLabel}</p>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors mb-3"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
        <div className="flex gap-2 text-gray-500">
          <Link to="/privacy" className="text-xs hover:text-emerald-400 transition-colors">Privacy</Link>
          <span className="text-xs">·</span>
          <Link to="/terms" className="text-xs hover:text-emerald-400 transition-colors">Terms</Link>
        </div>
      </div>
    </aside>
  );
}
