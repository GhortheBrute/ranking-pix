// src/types/index.ts

import React from "react";

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
    regras: RegrasJSON | null | undefined;
}

export interface OperadorSimples {
    matricula: number;
    nome: string;
}

export interface Operador {
    matricula: string;
    nome: string;
    apelido: string;
    valido?: number; // Vem do PHP como 0 ou 1
}

export interface ItemPesquisa extends OperadorSimples {
    quantidade: number;
}

export interface LancamentosBackend {
  matricula: number;
  nome: string;
  quantidade: string | number;
}

export interface DiaEspecial {
    data: string;
    fator: number;
}

export interface RegrasJSON {
    pontuacao: {
        fator_qtd_pix: number;
        fator_valor_pix: number;
        fator_qtd_recarga: number;
        fator_valor_recarga: number;
        fator_qtd_pesquisas: number;
        dias_especiais: DiaEspecial[];
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
    ativo?: number;
    regras: RegrasJSON | string;
    is_edit?: boolean;
}

export type ModeloRegraCriacao = Omit<ModeloRegra, 'id'> & { id?: number | null };

export interface RankingTableProps {
    dados: ItemRanking[];
    tipo: 'LOCAL' | 'MATRIZ';
    regras?: RegrasJSON; // Opcional: Se não vier, usamos pesos padrão ou 0
}

export interface RuleInputProps {
    value: number;
    onChange: (novoFator: number) => void;
    labelPontos?: string;
    labelReferencia?: string;
    min?: number;
    step?: number;
}

export interface BonusInputProps {
    meta: number;
    premio: number;
    onMetaChange: (val: number) => void;
    onPremioChange: (val: number) => void;
    labelMeta: string;
    unitMeta?: string; // ex: "transações", "R$"
    stepMeta?: number;
}

export interface DiasEspeciaisInputProps {
    dias: DiaEspecial[];
    onChange: (novosDias: DiaEspecial[]) => void;
}

export interface RegrasListaProps {
    modelos: ModeloRegra[];
    loading: boolean;
    onEdit: (m: ModeloRegra) => void;
    onToggle: (id: number) => void;
}

export interface RegrasModalProps {
    isOpen: boolean;
    onClose: () => void;
    editId: number | null;
    activeTab: 'financeiro' | 'gamificacao' | 'premios';
    setActiveTab: (tab: 'financeiro' | 'gamificacao' | 'premios') => void;
    formName: string;
    setFormName: (name: string) => void;
    formRegras: RegrasJSON;
    setFormRegras: React.Dispatch<React.SetStateAction<RegrasJSON>>;
    onSave: (e: React.FormEvent) => void;
    updateRegra: (section: keyof RegrasJSON, field: string, value: number | string) => void;
    updateBool: (section: keyof RegrasJSON, field: string, value: boolean) => void;
}

export interface Logs {
    id: number;
    data: string;
    usuario_id: number;
    usuario_nome: string;
    acao: string;
    detalhes: string;
    ip: string;
}

export interface SearchLogsProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}

export interface TableLogsProps {
    loading: boolean;
    data: Logs[];
    getBadgeColor: (acao: string) => void;
}

export interface PesquisaFormProps {
    itens: ItemPesquisa[];
    loading: boolean;
    selectedOperador: OperadorSimples | null;
    setSelectedOperador: (op: OperadorSimples | null) => void;
    torneio: Torneio;
    todosOperadores: OperadorSimples[];
    onAddOperador: () => void;
    onBack: () => void;
    onUpdateQuantidade: (index: number, nova_qtd: string) => void;
    onRemove: (index: number) => void;
    onSave: () => void;
}

export interface ItemSizeSelectProps {
    itemsPerPage: number;
    onChange: (e: React.SelectHTMLAttributes) => void;
    currentPage: number;
}

export interface PaginatedButtonsProps {
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
}

export interface OperadoresTableProps {
    loading: boolean;
    paginatedData: Operador[];
    handleOpenEdit: (op: Operador) => void;
    handleToggleStatus: () => void;
    filteredOps: Operador[];
}

export interface HomeTabsProps {
    hasLocal: boolean;
    hasMatriz: boolean;
    setActiveTab: (tab: 'local' | 'matriz') => void ;
    activeTab: 'local' | 'matriz';
}

export interface HomeBodyProps {
    activeTab: 'local' | 'matriz';
    hasLocal: boolean;
    hasMatriz: boolean;
    data: HomeRankingResponse | null;
    initialDate: string;
    endDate: string;
}

export interface HistoryDay {
    data: string;
    pix: Metrica;
    recarga: Metrica;
}

export interface HistoryOperatorResponse {
    torneio: {
        nome: string,
        regras: RegrasJSON
    };
    operador: {
        nome: string;
    };
    historico: HistoryDay[];
}