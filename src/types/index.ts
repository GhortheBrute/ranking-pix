// src/types/index.ts

export interface Metrica {
  qtd: number;
  valor: number;
}

export interface ItemRanking {
  matricula: number;
  nome: string;
  pix: Metrica;
  recarga: Metrica;
  pesquisas: number;
  pontuacao_geral: number; // Futuramente calculado pelo PHP ou Front
}

export interface DadosTorneio {
  torneio: Torneio;
  data: ItemRanking[];
}

export interface HomeRankingResponse {
    local: DadosTorneio | null;
    matriz: DadosTorneio | null;
}

export  interface Torneio {
    id: number;
    nome: string;
    tipo: 'LOCAL' | 'MATRIZ';
    data_inicio: string;
    data_fim: string;
    ativo?: boolean;
    regras: RegrasJSON | null;
}

export interface OperadorSimples {
    matricula: number;
    nome: string;
}

export interface ItemPesquisa extends OperadorSimples {
    quantidade: number;
}

export interface LancamentosBackend {
  matricula: number;
  nome: string;
  quantidade: string | number;
}

export interface RegrasJSON {
    pontuacao: {
        fator_qtd_pix: number;
        fator_valor_pix: number;
        fator_qtd_recarga: number;
        fator_valor_recarga: number;
        fator_qtd_pesquisas: number;
        peso_fds: number;
    };
    bonus: {
        meta_pix_qtd: number;
        meta_pix_valor: number;
        pontos_bonus_pix_qtd: number;
        pontos_bonus_pix_valor: number;
        meta_recarga_qtd: number;
        meta_recarga_valor: number;
        pontos_bonus_recarga_qtd: number;
        pontos_bonus_recarga_valor: number;
        meta_pesquisa: number;
        pontos_bonus_pesquisa: number;
    };
    premios: {
        ativar_roleta: boolean;
        pontos_para_roleta: number;
    };
}

export interface ModeloRegra {
    id: number;
    nome: string;
    ativo: number;
    regras: RegrasJSON | string;
}

export interface RankingTableProps {
    dados: ItemRanking[];
    tipo: 'LOCAL' | 'MATRIZ';
    regras?: RegrasJSON; // Opcional: Se não vier, usamos pesos padrão ou 0
}