// src/utils/math.ts

// Calcula o Máximo Divisor Comum
export function mdc(a: number, b: number): number {
    return b === 0 ? a : mdc(b, a % b);
}

// Transforma decimal em fração { numerador, denominador }
export function getFracaoInicial(fator: number) {
    if (fator === 0) return { numerador: 0, denominador: 1 };
    
    const s = fator.toString();
    // Se for inteiro (ex: 5), retorna 5/1
    if (!s.includes('.')) return { numerador: fator, denominador: 1 };

    const casas = s.split('.')[1].length;
    const denominador = Math.pow(10, casas);
    const numerador = Math.round(fator * denominador);
    const divisor = mdc(numerador, denominador);

    return {
        numerador: numerador / divisor,
        denominador: denominador / divisor,
    };
}

// 🆕 Função Helper para exibir na Lista
export function formatarFatorAmigavel(fator: number, labelItem: string, singularItem?: string): string {
    const { numerador, denominador } = getFracaoInicial(fator);

    if (numerador === 0) return "0 pts";

    const pontosLabel = numerador === 1 ? "ponto" : "pontos";
    const itemLabel = denominador === 1 ? (singularItem || labelItem) : labelItem;

    // Ex: "1 ponto a cada 50 PIX"
    return `${numerador} ${pontosLabel} a cada ${denominador} ${itemLabel}`;
}