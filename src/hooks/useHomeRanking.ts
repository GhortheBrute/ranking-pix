import { fetchHomeRanking } from "@/services/api";
import { HomeRankingResponse } from "@/types";
import { useState, useEffect } from "react";

export function useHomeRanking() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<HomeRankingResponse | null>(null);
    const [activeTab, setActiveTab] = useState<'local' | 'matriz'>('local');

    useEffect(() => {
        void loadData();
    }, []);

    const loadData = async () => {
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

    function formatDate(dataISO: string | undefined): string {
        // Se não houver data, retorna uma simples mensagem.
        if (!dataISO) return ("Data Inválida");

        const data = new Date(dataISO + "T00:00:00");
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(data);
    };

    // Variáveis auxiliares para limpar a lógica do JSX
    const hasLocal = !!data?.local;
    const hasMatriz = !!data?.matriz;
    const initialDate = formatDate(data?.local?.torneio.data_inicio);
    const endDate = formatDate(data?.local?.torneio.data_fim);

    return {
        // Estado
        loading,
        data,
        activeTab,
        setActiveTab,
        
        // Flags
        hasLocal,
        hasMatriz,
        
        // Datas Formatadas
        initialDate,
        endDate
    };
}