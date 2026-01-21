import { Operador } from "@/types";

interface Props {
    top3: Operador[];
    tipo: 'pix' | 'recarga';
    titulo: string;
}

export default function Podium({ top3, tipo, titulo }: Props) {
    // Garante que temos 3 posições (mesmo que vazias) para o layout não quebrar
    const primeiro = top3[0];
    const segundo = top3[1];
    const terceiro = top3[2];

    // Função auxiliar para renderizar o card do operador
    const renderCard = (op: Operador | undefined, pos: number, color: string, height: string) => {
        if (!op) return <div className={`w-1/3 ${height}`}></div>;

        return (
            <div className={`flex flex-col items-center justify-end w-1/3 ${pos === 1 ? '-mt-6 z-10' : ''}`}>
                
                {/* Avatar / Icone */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-2 border-4 border-white ${color}`}>
                    {pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}
                </div>

                {/* Barra do Pódio */}
                <div className={`w-full ${height} ${color} rounded-t-lg shadow-md flex flex-col items-center justify-start pt-4 text-white p-2 text-center transition-all hover:brightness-110`}>
                    <span className="font-bold text-sm md:text-base truncate w-full px-1">{op.nome}</span>
                    <span className="text-xs opacity-80 mb-1">{`Operador: ${op.matricula}`}</span>
                    
                    <div className="mt-2 bg-white/20 rounded px-2 py-1 text-xs md:text-sm font-mono">
                        {op[tipo].qtd} {tipo === 'pix' ? 'Pix' : 'Recargas'}
                    </div>
                    <div className="text-[10px] md:text-xs opacity-75 mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op[tipo].valor)}
                    </div>
                </div>
            </div>
        );
    };

    return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
        <h2 className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-6">{titulo}</h2>
        
        <div className="flex items-end justify-center w-full max-w-md gap-2">
            {/* 2º Lugar */}
            {renderCard(segundo, 2, 'bg-slate-500', 'h-40')}
            
            {/* 1º Lugar */}
            {renderCard(primeiro, 1, 'bg-yellow-500', 'h-64')}
            
            {/* 3º Lugar */}
            {renderCard(terceiro, 3, 'bg-orange-700', 'h-32')}
        </div>
    </div>
  );
}