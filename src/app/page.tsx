'use client';

import {useEffect, useMemo, useState} from 'react';
import { fetchHomeRanking } from '@/services/api';
import { HomeRankingResponse } from '@/types';
import RankingTable from '@/components/RankingTable'; // Supondo que você já tem ou vamos ajustar
import {Globe, MapPin, AlertCircle, LockKeyhole} from 'lucide-react';
import Link from "next/link";
import Podium from "@/components/Podium"; // Ícones opcionais (se tiver lucide-react)

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<HomeRankingResponse | null>(null);
    const [activeTab, setActiveTab] = useState<'local' | 'matriz'>('local');

    useEffect(() => {
        void carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const response = await fetchHomeRanking();
            setData(response);

            // Lógica Inteligente de Aba Inicial:
            // Se não tem Local, mas tem Matriz, muda o foco para Matriz automaticamente.
            if (!response.local && response.matriz) {
                setActiveTab('matriz');
            }
        } catch (error) {
            console.error('Erro ao carregar ranking', error);
        } finally {
            setLoading(false);
        }
    };

    const rankingAtivo = useMemo(() => {
        if (!data) return [];
        const target = activeTab === 'local' ? data.local : data.matriz;
        if (!target) return [];

        // Calcula pontos e ordena
        const lista = target.data.map(item => {
            let pontos = 0;
            if (activeTab === 'matriz') {
                pontos = item.pix.qtd;
            } else {
                pontos = item.pix.qtd + item.recarga.qtd + item.pesquisas;
            }
            return { ...item, pontos };
        });

        return lista.sort((a, b) => b.pontos - a.pontos);
    }, [data, activeTab]);


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 text-blue-600">
                <div className="text-xl font-bold animate-pulse">Carregando Rankings...</div>
            </div>
        );
    }

    function formatarData(dataISO: string): string {
        const data = new Date(dataISO + "T00:00:00");
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(data);
    }

    // Variáveis auxiliares para limpar a lógica do JSX
    const hasLocal = !!data?.local;
    const hasMatriz = !!data?.matriz;
    const dataInicio = formatarData(data?.local?.torneio.data_inicio);
    const dataFim = formatarData(data?.local?.torneio.data_fim);

    // 1. Caso: Nenhum Torneio Ativo
    if (!hasLocal && !hasMatriz) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-500 relative">
                {/* Botão Admin mesmo na tela vazia */}
                <div className="absolute top-4 right-4">
                    <Link href="/admin" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">
                        <LockKeyhole size={16} /> Área Restrita
                    </Link>
                </div>
                <AlertCircle size={64} className="mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold">Sem Torneios Ativos</h2>
                <p>Não há torneios vigentes no momento.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-orange-300 p-4 md:p-8 relative">

            {/* --- BOTÃO DE ADMIN (Topo Direito) --- */}
            <div className="absolute top-4 right-4 md:top-6 md:right-8 z-20">
                <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition-all text-sm font-medium"
                >
                    <LockKeyhole size={16} />
                    <span className="hidden md:inline">Painel Administrativo</span>
                </Link>
            </div>
            <div className="max-w-6xl mx-auto">

                {/* --- ÁREA DAS ABAS (Só aparece se TIVER OS DOIS) --- */}
                {hasLocal && hasMatriz && (
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                            <button
                                onClick={() => setActiveTab('local')}
                                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                                    ${activeTab === 'local'
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {/* Ícone de Mapa/Local (opcional) */}
                                <MapPin size={16} />
                                Ranking Filial
                            </button>
                            <button
                                onClick={() => setActiveTab('matriz')}
                                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                                    ${activeTab === 'matriz'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {/* Ícone de Globo/Mundo (opcional) */}
                                <Globe size={16} />
                                Prévia Ranking Nacional
                            </button>
                        </div>
                    </div>
                )}

                {/* Cabeçalho */}
                <div className="mb-2 text-center">
                    <h1 className="text-3xl font-extrabold text-blue-900">
                        Ranking Frente de Caixa
                    </h1>
                </div>

                {/* --- CONTEÚDO --- */}

                {/* VISUALIZAÇÃO LOCAL */}
                {activeTab === 'local' && hasLocal && data?.local && (
                    <>
                        <div className="flex items-center gap-2 text-blue-800 justify-center">
                            <MapPin className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Torneio - {data.local.torneio.nome}</h2>
                        </div>
                        <div className='mb-4 flex items-center text-blue-800 justify-center'>
                            <h3 className="text-xs font-bold">Período de {dataInicio} a {dataFim}</h3>
                        </div>

                        {/* PODIUM */}
                        {/* <Podium top3={top3} tipo={activeTab === 'local' ? 'LOCAL' : 'MATRIZ'} /> */}
                        <RankingTable dados={data.local.data} tipo="LOCAL" regras={data.local.torneio.regras} />
                    </>
                )}

                {/* VISUALIZAÇÃO MATRIZ */}
                {activeTab === 'matriz' && hasMatriz && data?.matriz && (
                    <div className="animate-fade-in">
                        {/* Se só tem Matriz (sem abas), mostra um título específico */}
                        {!hasLocal && (
                            <div className="mb-4 flex items-center gap-2 text-green-800">
                                <Globe className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Prévia Ranking Nacional</h2>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4 text-sm border border-green-200">
                                ℹ️ Este ranking considera apenas transações únicas de PIX, conforme regra nacional.
                            </div>

                            <RankingTable dados={data.matriz.data} tipo="MATRIZ" />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

// --- Componente Temporário de Tabela para testarmos a lógica (substitua pelo seu oficial) ---
function TabelaSimples({ dados, tipo }: { dados: any[], tipo: string }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="text-gray-500 border-b border-gray-100 text-sm uppercase tracking-wider">
                    {tipo === 'LOCAL' && <th className="p-3">Pos</th>}
                    <th className="p-3">Operador</th>
                    <th className="p-3 text-right">PIX (Qtd)</th>
                    <th className="p-3 text-right">PIX ($)</th>
                    {tipo === 'LOCAL' && <th className="p-3 text-right">Recargas</th>}
                    {tipo === 'LOCAL' && <th className="p-3 text-right">Pesquisas</th>}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {dados.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                        {tipo === 'LOCAL' && <td className="p-3 font-bold text-gray-400">#{index + 1}</td>}
                        <td className="p-3 font-medium text-gray-800">{item.nome}</td>
                        <td className="p-3 text-right font-bold text-blue-600">{item.pix.qtd}</td>
                        <td className="p-3 text-right text-gray-600">
                            {item.pix.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        {tipo === 'LOCAL' && (
                            <>
                                <td className="p-3 text-right">{item.recarga.qtd}</td>
                                <td className="p-3 text-right">{item.pesquisas}</td>
                            </>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}