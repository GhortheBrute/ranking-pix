'use client';

import React, {useState, useEffect} from 'react';
import { Search } from 'lucide-react';

interface Logs {
    id: number;
    data: string;
    usuario_id: number;
    usuario_nome: string;
    acao: string;
    detalhes: string;
    ip: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Logs[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/logs.php');
            const data = await res.json();
            setLogs(data);
        } catch (error) {
            console.error('Erro ao recuperar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);


    // Filtro seguro (verifica se usuario_nome existe antes de dar toLowerCase)
    const filteredLogs = logs.filter(l =>
        (l.usuario_nome && l.usuario_nome.toLowerCase().includes(filtro.toLowerCase())) ||
        (l.acao && l.acao.toLowerCase().includes(filtro.toLowerCase())) ||
        l.id.toString().includes(filtro)
    );

    // Função auxiliar para colorir a badge de ação
    const getBadgeColor = (acao: string) => {
        const a = acao.toLowerCase();
        if (a.includes('delete') || a.includes('excluir') || a.includes('inativar')) return 'bg-red-100 text-red-700';
        if (a.includes('update') || a.includes('editar') || a.includes('alterar')) return 'bg-blue-100 text-blue-700';
        if (a.includes('create') || a.includes('criar') || a.includes('novo')) return 'bg-green-100 text-green-700';
        if (a.includes('pesquisa')) return 'bg-orange-100 text-orange-100';
        if (a.includes('torneio')) return 'bg-gray-100 text-white';
        return 'bg-gray-100 text-gray-700'; // Padrão
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Logs de Usuários</h1>
            </div>

            {/* BARRA DE PESQUISA */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 flex items-center gap-2">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar usuário por nome ou ID..."
                    className="flex-1 outline-none text-slate-700"
                    value={filtro}
                    onChange={e => setFiltro(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="w-full bg-white rounded shadow text-sm">
                    <thead className="bg-slate-700 border-b border-gray-200 text-white uppercase text-xs">
                    <tr>
                        <th className="p-2">Data/Hora</th>
                        <th className="p-2">Username</th>
                        <th className="p-2">Ação</th>
                        <th className="p-2">Detalhes</th>
                        <th className="p-2">IP</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
                    ) : filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors border-b font-mono text-xs text-center">
                            <td className="p-2 font-mono text-slate-900">{log.data}</td>
                            <td className="p-2 font-bold">{log.usuario_nome}</td>
                            <td className="p-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getBadgeColor(log.acao)}`}>
                                    {log.acao ? log.acao.toUpperCase() : 'USER'}
                                </span>
                            </td>
                            <td className="p-2 text-slate-600">{log.detalhes}</td>
                            <td className="p-2 text-slate-400">{log.ip}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}