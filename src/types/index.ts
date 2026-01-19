// src/types/index.ts

export interface Metrica {
  qtd: number;
  valor: number;
}

export interface Operador {
  matricula: number;
  nome: string;
  pix: Metrica;
  recarga: Metrica;
  pontuacao_geral: number; // Futuramente calculado pelo PHP ou Front
}

export interface RankingResponse {
  periodo: {
    inicio: string;
    fim: string;
  };
  data: Operador[];
}