import { Heart, MessageCircle } from 'lucide-react';

interface GalleryCardProps {
    item: {
        id: number;
        title: string;
        author: string;
        likes: number;
        comments: number;
        image: string;
    };
}

export function GalleryCard({ item }: GalleryCardProps) {
    return (
        <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl bg-[#141816] border border-white/5 card-hover">
                <div className="aspect-auto relative">
                    <img src={item.image} alt={item.title} className="w-full h-auto object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F0E]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Hover Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h4 className="text-white font-medium text-sm mb-2">{item.title}</h4>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                                    {item.author[0]}
                                </div>
                                <span className="text-gray-400 text-xs">{item.author}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Heart className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-400 text-xs">{item.likes}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-400 text-xs">{item.comments}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
