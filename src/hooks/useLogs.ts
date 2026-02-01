import { fetchLogsData } from "@/services/api";
import { Logs } from "@/types";
import { useState, useEffect } from "react";

export function useLogs() {
    const [logs, setLogs] = useState<Logs[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    const fetchLogs = async () => {
        try {
            const data = await fetchLogsData();
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
        if (a.includes('pesquisas')) return 'bg-orange-100 text-slate-600';
        if (a.includes('torneio')) return 'bg-gray-100 text-white';
        return 'bg-gray-100 text-gray-700'; // Padrão
    };

    return {
        logs,
        setLogs,
        loading,
        setLoading,
        filtro,
        setFiltro,
        fetchLogs,
        filteredLogs,
        getBadgeColor
    }
}