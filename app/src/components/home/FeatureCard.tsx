

// Feature cards data type
interface FeatureCardProps {
    card: {
        title: string;
        subtitle: string;
        image: string;
        gradient: string;
        path: string;
    };
    onClick?: () => void;
}

export function FeatureCard({ card, onClick }: FeatureCardProps) {
    return (
        <div
            onClick={onClick}
            className="relative group cursor-pointer overflow-hidden rounded-2xl bg-[#1A1E1C] border border-white/5 card-hover"
        >
            <div className="absolute inset-0">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient} opacity-40`} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F0E] via-transparent to-transparent" />
            </div>
            <div className="relative p-5 h-40 flex flex-col justify-end">
                <h3 className="text-white font-semibold text-lg mb-1">{card.title}</h3>
                <p className="text-gray-400 text-xs">{card.subtitle}</p>
            </div>
        </div>
    );
}
