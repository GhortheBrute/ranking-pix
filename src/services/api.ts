import {
    Torneio,
    ItemPesquisa,
    OperadorSimples,
    HomeRankingResponse,
    ItemRanking,
    DadosTorneio,
    ModeloRegra
} from "@/types";

export const fetchHomeRanking = async (): Promise<HomeRankingResponse> => {
    const response = await fetch("/api/ranking.php");
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

export const fetchRegras= async (): Promise<ModeloRegra[]> => {
    const response = await fetch(`/api/regras.php`);
    if (!response.ok) throw new Error('Falha ao buscar dados do modelo.');
    return response.json();
}

export async function saveRegras(payload: ModeloRegra): Promise<{ success: boolean, error?: string }> {
    const response = await fetch('/api/regras.php', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return response.json();
}

export async function toggleRegras(acao: string, id: number): Promise<{ success: boolean, error?: string }> {
    const response = await fetch('/api/regras.php', {
        method: 'POST',
        body: JSON.stringify({acao, id})
    });
    return response.json();
}