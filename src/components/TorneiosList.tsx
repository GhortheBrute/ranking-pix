'use client';

import { Torneio } from '@/types';
import { ArrowLeft, Trophy } from 'lucide-react';

interface TorneiosListProps {
    torneioVigente: Torneio | null;
    outrosTorneios: Torneio[];
    onSelect: (torneio: Torneio) => void;
    loading: boolean;
}

export function TorneiosList({ torneioVigente, outrosTorneios, onSelect, loading }: TorneiosListProps) {
    // Tratamento do loading
    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <p className="text-gray-500 animate-pulse">Carregando torneios...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                📊 Lançamento de Pesquisas
            </h1>

            {/* --- DESAFIO --- */}
            {/* Cola aqui os blocos do "Torneio Vigente" e "Outros Torneios" 
                que estão no teu arquivo page.tsx original. 
                
                Lembra-te de substituir a chamada antiga:
                onClick={() => handleSelectTorneio(t)} 
                
                Pela nova prop:
                onClick={() => onSelect(t)}
            */}
            {torneioVigente && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">Torneio Vigente</h2>
                        <div
                            onClick={() => onSelect(torneioVigente)}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white shadow-lg cursor-pointer transform transition hover:scale-[1.01] hover:shadow-xl group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Trophy className="text-yellow-300" size={24} />
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">ATUAL</span>
                                    </div>
                                    <h3 className="text-2xl font-bold">{torneioVigente.nome}</h3>
                                    <p className="text-blue-100 mt-1 text-sm">
                                        {new Date(torneioVigente.data_inicio).toLocaleDateString('pt-BR')} até {new Date(torneioVigente.data_fim).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition">
                                    <ArrowLeft className="rotate-180" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Outros Torneios */}
                {outrosTorneios.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">Outros Torneios Ativos</h2>
                        <div className="grid gap-4">
                            {outrosTorneios.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => onSelect(t)}
                                    className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-bold text-slate-700">{t.nome}</h3>
                                        <p className="text-xs text-gray-500">
                                            {new Date(t.data_inicio).toLocaleDateString('pt-BR')} - {new Date(t.data_fim).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <ArrowLeft className="rotate-180 text-gray-300" size={20} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </div>
    );
}