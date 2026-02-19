import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Zap,
    Wand,
    ShoppingCart,
    Bell,
    LogOut,
    User,
    Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, getUserDisplayInfo } from '@/hooks/useAuth';
import { ProfileModal } from '@/components/ProfileModal';

export function Header() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { displayName, avatarUrl, initial } = getUserDisplayInfo(user);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setDropdownOpen(false);
        navigate('/');
    };

    return (
        <>
            <header className="fixed top-0 left-60 right-0 h-16 glass-effect border-b border-white/5 z-40 px-6 flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-2xl">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search models, creators, styles..."
                            className="w-full pl-11 pr-24 py-2.5 bg-[#141816] border-white/10 rounded-full text-sm text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                        <Button
                            size="sm"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-full text-xs px-3 h-7"
                        >
                            <Zap className="w-3 h-3 mr-1" />
                            AI Search
                        </Button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => navigate('/generate')}
                        className="bg-gradient-emerald hover:opacity-90 text-white rounded-full px-5 gap-2"
                    >
                        <Wand className="w-4 h-4" />
                        Create
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5 relative">
                        <ShoppingCart className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                    </Button>

                    {/* User Avatar + Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center cursor-pointer ring-2 ring-transparent hover:ring-emerald-500/50 transition-all"
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                                    {initial}
                                </div>
                            )}
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute right-0 top-12 w-64 bg-[#1a1d1b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* User info */}
                                <div className="p-4 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={displayName}
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {initial}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">{displayName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu items */}
                                <div className="p-1.5">
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            setProfileModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            navigate('/pricing');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Manage Subscription
                                    </button>
                                </div>

                                {/* Sign out */}
                                <div className="p-1.5 border-t border-white/5">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Profile Modal */}
            <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
        </>
    );
}
