'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, CalendarClock, Trophy, Users } from 'lucide-react';

interface DashboardStats {
    torneio: {
        ativo: boolean;
        nome?: string;
        fim?: string;
        id?: number;
    };
    operadores: number;
    ultima_atualizacao: string;
}

export default function DashboardHome() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Administrador');

    useEffect(() => {
        // Pega o nome do usuário
        const token = localStorage.getItem('admin_token');
        if (token) {
            try {
                const user = JSON.parse(token);
                setUserName(user.username || 'Administrador');
            } catch (e) {
                console.log("Erro: ", e);
            }
        }

        // Busca dados da API
        async function fetchStats() {
            try {
                const res = await fetch('/api/dashboard_home.php');
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error('Erro ao buscar stats', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div className='p-8 text-slate-500 flex items-center gap-2'><Activity className='animate-spin' />Carregando dados...</div>

    return (
        <div className="space-y-8">
            {/* Boas vindas */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Olá, {userName}</h1>
                <p className="text-slate-500">Aqui está o resumo da performance da sua equipe hoje.</p>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CARD 1: TORNEIO */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${stats?.torneio.ativo ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                            <Trophy size={24} />
                        </div>
                        {stats?.torneio.ativo && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase">
                                Ativo
                            </span>
                        )}
                    </div>
                    
                    {stats?.torneio.ativo ? (
                        <>
                            <h3 className="text-slate-500 text-sm font-medium">Torneio Vigente</h3>
                            <p className="text-xl font-bold text-slate-800 mt-1 line-clamp-1" title={stats.torneio.nome}>
                                {stats.torneio.nome}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                Encerra em: <span className="text-slate-600 font-medium">{stats.torneio.fim}</span>
                            </p>
                            <Link 
                                href="/admin/dashboard/torneios" 
                                className="absolute bottom-0 left-0 w-full bg-yellow-50 text-yellow-700 text-xs py-2 px-6 translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between"
                            >
                                Ver detalhes <ArrowRight size={14} />
                            </Link>
                        </>
                    ) : (
                        <>
                            <h3 className="text-slate-500 text-sm font-medium">Torneios</h3>
                            <p className="text-lg font-bold text-slate-400 mt-1">Nenhum ativo</p>
                            <Link href="/admin/dashboard/torneios" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                                Criar novo torneio
                            </Link>
                        </>
                    )}
                </div>

                {/* CARD 2: OPERADORES */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                            <Users size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Total de Operadores</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.operadores}</p>
                    <p className="text-xs text-slate-400 mt-2 mb-2">Participando dos rankings</p>

                    <Link 
                        href="/admin/dashboard/operadores" 
                        className="absolute bottom-0 left-0 w-full bg-blue-50 text-blue-700 text-xs py-2 px-6 translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between"
                    >
                        Gerenciar equipe <ArrowRight size={14} />
                    </Link>
                </div>

                {/* CARD 3: ÚLTIMA ATUALIZAÇÃO */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
                            <CalendarClock size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Últimos Dados</h3>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.ultima_atualizacao}</p>
                    <p className="text-xs text-slate-400 mt-2">Baseado em Pix e Recargas</p>
                    
                    {/* Exibe link de upload apenas se for admin (opcional, verificando visualmente apenas) */}
                    <Link 
                        href="/admin/dashboard/upload" 
                        className="absolute bottom-0 left-0 w-full bg-emerald-50 text-emerald-700 text-xs py-2 px-6 translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between"
                    >
                        Atualizar dados <ArrowRight size={14} />
                    </Link>
                </div>

            </div>
            
            {/* Opcional: Uma área secundária para gráficos rápidos ou avisos poderia entrar aqui */}
        </div>
    );
}