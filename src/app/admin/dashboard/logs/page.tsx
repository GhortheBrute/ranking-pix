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


    const filteredLogs = logs.filter(l =>
        l.usuario_nome.toLowerCase().includes(filtro.toLowerCase()) ||
        l.usuario_id.toString().includes(filtro)
    );

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
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="p-4 w-16">Data/Hora</th>
                        <th className="p-4 text-center">Username</th>
                        <th className="p-4 text-center">Ação</th>
                        <th className="p-4">Detalhes</th>
                        <th className="p-4">IP</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
                    ) : logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono text-slate-500">{log.data}</td>
                            <td className="p-4 font-medium text-slate-800">{log.usuario_nome}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.acao === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {log.acao ? log.acao.toUpperCase() : 'USER'}
                                </span>
                            </td>
                            <td className="p-4 font-medium text-slate-800">{log.detalhes}</td>
                            <td className="p-4 font-medium text-slate-800">{log.ip}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}