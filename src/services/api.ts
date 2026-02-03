import {
    Torneio,
    ItemPesquisa,
    HomeRankingResponse,
    ModeloRegra,
    ModeloRegraCriacao,
    Logs,
    Operador,
    HistoryOperatorResponse
} from "@/types";

// --- HOME ---
// Busca os dados de ranking da página inicial
export const fetchHomeRanking = async (): Promise<HomeRankingResponse> => {
    const response = await fetch("/api/ranking.php");
    return response.json();
}

// --- PESQUISAS ---
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

// Salvar os dados de Pesquisas
export async function savePesquisas(torneioId: number, itens: ItemPesquisa[]): Promise<{ sucesso: boolean, erro?: string }> {
    const response = await fetch('/api/pesquisas.php', {
        method: 'POST',
        body: JSON.stringify({ torneio_id: torneioId, itens })
    });
    return response.json();
}

// --- REGRAS ---
// Buscar a lista de Regras
export const fetchRegras = async (): Promise<ModeloRegra[]> => {
    const response = await fetch(`/api/regras.php`);
    if (!response.ok) throw new Error('Falha ao buscar dados do modelo.');
    return response.json();
}

// Salvar os dados de Regra
export async function saveRegras(payload: ModeloRegraCriacao): Promise<{ success: boolean, error?: string }> {
    const response = await fetch('/api/regras.php', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return response.json();
}

// Ativar ou desativar Regras
export async function toggleRegras(acao: string, id: number): Promise<{ success: boolean, error?: string }> {
    const response = await fetch('/api/regras.php', {
        method: 'POST',
        body: JSON.stringify({acao, id})
    });
    return response.json();
}

// --- LOGS ---
// Buscar dados de Logs
export const fetchLogsData = async (): Promise<Logs[]> => {
    const response = await fetch('/api/logs.php');
    if (!response.ok) throw new Error('Falha ao buscar logs');
    return response.json();
}

// --- OPERADORES ---
// Buscar dados de Operadores
export const fetchOperadoresData = async (): Promise<Operador[]> => {
    const response = await fetch('/api/operadores.php');
    if (!response.ok) throw new Error('Falha ao buscar operadores');
    return response.json();
}

// Salvar os dados de Operador
export async function saveOperador(payload: Operador): Promise<{ sucesso: boolean, error?: string }> {
    const response = await fetch('/api/operadores.php', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return response.json();
}

// Ativar/Desativar Operador
export async function ToggleOperador(acao: string, matricula: number): Promise<{ success: boolean, error?: string }> {
    const response = await fetch('/api/operadores.php', {
        method: 'POST',
        body: JSON.stringify({acao, matricula})
    });
    return response.json();
}

// Buscar detalhes de operador na HOME
export async function fetchOperadorHistory(matricula: number, startDate: string, endDate: string, torneioId: number): Promise<HistoryOperatorResponse> {
    const response = await fetch('/api/operador_history.php', {
        method: 'POST',
        body: JSON.stringify({matricula, startDate, endDate, torneioId})
    });
    return response.json();
}