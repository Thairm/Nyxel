import { Badge } from '@/components/ui/badge';

interface ModelCardProps {
    model: {
        id: number;
        name: string;
        type: string;
        rating: number;
        image: string;
        badge: string;
        free: boolean;
    };
}

export function ModelCard({ model }: ModelCardProps) {
    return (
        <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl bg-[#141816] border border-white/5 card-hover">
                <div className="aspect-[3/4] relative">
                    <img src={model.image} alt={model.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F0E] via-transparent to-transparent opacity-80" />

                    {/* LATEST Badge */}
                    {model.free && (
                        <Badge className="absolute top-2 right-2 bg-gradient-amber text-white text-[10px] border-0 font-bold">
                            LATEST
                        </Badge>
                    )}

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-white font-medium text-sm truncate mb-1">{model.name}</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">{model.type}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
