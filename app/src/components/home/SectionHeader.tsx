import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    icon?: React.ElementType;
    action?: string;
}

export function SectionHeader({ title, icon: Icon, action }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5 text-emerald-400" />}
                <h2 className="text-white font-semibold text-lg">{title}</h2>
            </div>
            {action && (
                <a href="#" className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                    {action}
                    <ChevronRight className="w-4 h-4" />
                </a>
            )}
        </div>
    );
}
