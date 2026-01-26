import { Torneio, RankingResponse, ItemPesquisa, OperadorSimples } from "@/types";

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

// Módulo de pesquisas
// Buscar lista de torneios (Vigente e Outros)
export async function fetchTorneiosPesquisa(): Promise<{ vigente: Torneio | null, outros: Torneio[] }> {
    const response = await fetch('/api/pesquisas.php');
    if (!response.ok) throw new Error('Falha ao buscar dados de torneios.');
    return response.json();
}

// Buscar detalhes de um torneio específico
export async function fetchDetalhesPesquisa(torneioId: number) {
    const response = await fetch(`/api/pesquisas.php?torneio_id=${torneioId}`);
    if (!response.ok) throw new Error('Falha ao buscar dados do torneio.');
    return response.json();
}

// Salvar os dados
export async function savePesquisas(torneioId: number, itens: ItemPesquisa[]): Promise<{ sucesso: boolean, erro?: string }> {
    const response = await fetch('/api/pesquisas.php', {
        method: 'POST',
        body: JSON.stringify({ torneio_id: torneioId, itens })
    });
    return response.json();
}