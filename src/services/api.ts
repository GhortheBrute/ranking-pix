import {RankingResponse} from "@/types/Ranking";

export async function fetchRanking(inicio?: string, fim?: string): Promise<RankingResponse> {
    // Monta a query string se as datas existirem
    const params = new URLSearchParams();
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);

    // Em produção: /api/get_ranking.php
    // Em desenvolvimento: o rewrite cuida
    const response = await fetch(`/api/get_ranking.php?${params.toString()}`);

    if (!response.ok) throw new Error('Falha ao buscar dados do ranking');

    return response.json();
}