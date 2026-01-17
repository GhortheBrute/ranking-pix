export interface OperadorRanking {
    matricula: number;
    nome: string;
    pix: {
        qtd: number,
        valor: number;
    };
    recarga: {
        qtd: number,
        valor: number;
    };
    pontuacao_geral: number;
}

export interface RankingResponse{
    periodo: {
        inicio: string;
        fim: string;
    };
    data: OperadorRanking[];
}