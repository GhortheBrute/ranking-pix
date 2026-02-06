import {
    Torneio,
    ItemPesquisa,
    HomeRankingResponse,
    ModeloRegra,
    ModeloRegraCriacao,
    Logs,
    Operador,
    HistoryOperatorResponse,
    DashboardStats,
    TorneioProps,
    TorneioPayload,
    UploadType,
    UploadResponse,
    Usuario,
    UsuarioPayload
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/ranking_pix/api';

// --- HOME ---
// Busca os dados de ranking da página inicial
export const fetchHomeRanking = async (): Promise<HomeRankingResponse> => {
    const response = await fetch(`${API_BASE}/ranking.php`, {
        credentials: "include"
    });
    return response.json();
}

// --- PESQUISAS ---
// Buscar lista de torneios (Vigente e Outros)
export async function fetchTorneiosPesquisa(): Promise<{ vigente: Torneio | null, outros: Torneio[] }> {
    const response = await fetch(`${API_BASE}/pesquisas.php`, {
        credentials: "include"
    });
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
    const response = await fetch(`${API_BASE}/pesquisas.php`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ torneio_id: torneioId, itens })
    });
    return response.json();
}

// --- REGRAS ---
// Buscar a lista de Regras
export const fetchRegras = async (): Promise<ModeloRegra[]> => {
    const response = await fetch(`${API_BASE}/regras.php`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error('Falha ao buscar dados do modelo.');
    return response.json();
}

// Salvar os dados de Regra
export async function saveRegras(payload: ModeloRegraCriacao): Promise<{ success: boolean, error?: string }> {
    const response = await fetch(`${API_BASE}/regras.php`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload)
    });
    return response.json();
}

// Ativar ou desativar Regras
export async function toggleRegras(acao: string, id: number): Promise<{ success: boolean, error?: string }> {
    const response = await fetch(`${API_BASE}/regras.php`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({acao, id})
    });
    return response.json();
}

// --- LOGS ---
// Buscar dados de Logs
export const fetchLogsData = async (): Promise<Logs[]> => {
    const response = await fetch(`${API_BASE}/logs.php`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error('Falha ao buscar logs');
    return response.json();
}

// --- OPERADORES ---
// Buscar dados de Operadores
export const fetchOperadoresData = async (): Promise<Operador[]> => {
    const response = await fetch(`${API_BASE}/operadores.php`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error('Falha ao buscar operadores');
    return response.json();
}

// Salvar os dados de Operador
export async function saveOperador(payload: Operador): Promise<{ sucesso: boolean, error?: string }> {
    const response = await fetch(`${API_BASE}/operadores.php`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload)
    });
    return response.json();
}

// Ativar/Desativar Operador
export async function ToggleOperador(acao: string, matricula: number): Promise<{ success: boolean, error?: string }> {
    const response = await fetch(`${API_BASE}/operadores.php`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({acao, matricula})
    });
    return response.json();
}

// Buscar detalhes de operador na HOME
export async function fetchOperadorHistory(matricula: number, startDate: string, endDate: string, torneioId: number): Promise<HistoryOperatorResponse> {
    const response = await fetch(`${API_BASE}/operador_history.php`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({matricula, startDate, endDate, torneioId})
    });
    return response.json();
}

// LOGIN
export async function handleLoginData(login: string, senha: string): Promise<{ sucesso: boolean, usuario: object, session_id_login: string, erro?: string }>{
    const response = await fetch (`${API_BASE}/admin.php?acao=login`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({ login, senha })
        });
    return response.json();
}

// Dashboard_Home data
export const fetchStatusData = async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE}/dashboard_home.php`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error('Falha ao buscar dados');
    return response.json();
}

// TORNEIOS
// fetch Torneios
export const fetchTorneiosData = async (): Promise<TorneioProps[]> => {
    const response = await fetch(`${API_BASE}/torneios.php`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error('Falha ao buscar torneios');
    return response.json();
}

// fetch Regras
export const fetchTorneiosRegras = async (): Promise<ModeloRegra[]> => {
    const response = await fetch(`${API_BASE}/regras.php`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error('Falha ao buscar regras');
    return response.json();
}

// handleSaveTorneios
export async function handleSaveTorneios(payload: TorneioPayload): Promise<{ success: boolean, error?: string, id: number | null }>{
    const response = await fetch (`${API_BASE}/torneios.php`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(payload)
        });
    return response.json();
}

// Ativar/Desativar Torneio
export async function ToggleTorneio(acao: string, id: number): Promise<{ success: boolean, error?: string }> {
    const response = await fetch(`${API_BASE}/torneios.php`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({acao, id})
    });
    return response.json();
}

// UPLOAD
// Subir ARQUIVO
export async function uploadRankingFile(type: UploadType, file_name: string, file: File): Promise<UploadResponse> {
    const endpointMap = {
        'PIX': 'upload_pix.php',
        'RECARGA': 'upload_recarga.php'
    };

    const endpoint = endpointMap[type];

    const formData = new FormData();
    formData.append(file_name, file);
    //formData.append('file_name', file_name);
    //formData.append('csv_file', file);

    const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    if (!response.ok) throw new Error(`Erro ao enviar arquivo para ${endpoint}.`);

    return response.json();
}

// Salvar
export async function handleSaveUpload(payload: Operador): Promise<{ sucesso: boolean, erro?: string }>{
    const response = await fetch (`${API_BASE}/operadores.php`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(payload)
        });
    return response.json();
}

// USUARIOS
// fetch
export const fetchUsuariosData = async (): Promise<Usuario[]> => {
    const response = await fetch(`${API_BASE}/usuarios.php`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error('Falha ao buscar usuários');
    return response.json();
}

// Save
export async function handleSaveUsuario(payload: UsuarioPayload): Promise<{ sucesso: boolean, erro?: string }>{
    const response = await fetch (`${API_BASE}/usuarios.php`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(payload)
        });
    return response.json();
}