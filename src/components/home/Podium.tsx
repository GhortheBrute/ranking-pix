import { ItemRanking } from "@/types";
import { Medal, Crown } from "lucide-react";

interface PodiumProps {
    top3: ItemRanking[];
    tipo: 'LOCAL' | 'MATRIZ';
}

export default function Podium({ top3, tipo }: PodiumProps) {
    if (top3.length === 0) return null;

    // Organiza para o layout visual: [2º Lugar, 1º Lugar, 3º Lugar]
    // O array top3 vem ordenado [1º, 2º, 3º]
    const primeiro = top3[0];
    const segundo = top3.length > 1 ? top3[1] : null;
    const terceiro = top3.length > 2 ? top3[2] : null;

    const renderCard = (item: ItemRanking, posicao: number, colorClass: string, heightClass: string, icon: React.ReactNode) => (
        <div className={`flex flex-col items-center justify-end ${posicao === 1 ? '-mt-4 z-10' : ''}`}>

            {/* Avatar / Ícone */}
            <div className="mb-2 relative">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${colorClass} bg-white flex items-center justify-center shadow-lg`}>
                    <span className="text-xl md:text-2xl font-bold text-gray-700">
                        {item.nome.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-sm">
                    {icon}
                </div>
            </div>

            {/* O Degrau do Pódio */}
            <div className={`w-24 md:w-32 ${heightClass} ${colorClass.replace('border-', 'bg-')} rounded-t-lg shadow-md flex flex-col items-center justify-start pt-4 text-white relative`}>
                <span className="text-2xl font-black opacity-50 absolute bottom-2">{posicao}º</span>

                {/* Nome e Pontos */}
                <div className="text-center px-1 z-10">
                    <p className="text-xs md:text-sm font-bold truncate max-w-[90px] md:max-w-[110px] leading-tight">
                        {item.nome}
                    </p>
                    <p className="text-[10px] md:text-sm opacity-90 mt-1">
                        {tipo === 'MATRIZ'
                            ? `${item.pix.qtd} transações`
                            : `${(item.pontuacao_geral).toFixed(0) || 0} pts`
                        }
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 mb-2 w-2/3 justify-self-center">
            <div className="flex justify-center items-end gap-2 md:gap-4 mb-10 mt-6 px-4 ">
                {/* 2º Lugar */}
                {segundo && renderCard(
                    segundo, 2,
                    "border-gray-500 bg-gray-500",
                    "h-24 md:h-32",
                    <Medal className="w-6 h-6 text-gray-400" />
                )}

                {/* 1º Lugar */}
                {primeiro && renderCard(
                    primeiro, 1,
                    "border-yellow-500 bg-yellow-500",
                    "h-32 md:h-40",
                    <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                )}

                {/* 3º Lugar */}
                {terceiro && renderCard(
                    terceiro, 3,
                    "border-amber-600 bg-amber-600",
                    "h-20 md:h-24",
                    <Medal className="w-6 h-6 text-amber-700" />
                )}
            </div>
        </div>
    );
}