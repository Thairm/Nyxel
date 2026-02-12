import { useNavigate } from 'react-router-dom';
import {
    Search,
    Zap,
    Wand,
    ShoppingCart,
    Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
    const navigate = useNavigate();

    return (
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
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
                    U
                </div>
            </div>
        </header>
    );
}
