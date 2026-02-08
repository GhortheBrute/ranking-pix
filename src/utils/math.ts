// src/utils/math.ts

import { PontuacaoRegrasJSON } from "@/types";

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
export function formatarFatorAmigavel(
    points: number,
    reference: number,
    labelItem: string,
    singularItem?: string,
    money?: boolean
    ): string {

    if (points === 0 || reference === 0) return "0 pts";

    let formatedValue = reference.toString();

    const pointsLabel = points === 1 ? "ponto" : "pontos";
    const itemLabel = (reference === 1 && singularItem) ? singularItem : labelItem;

    if (money) {
        formatedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency:'BRL' }).format(reference);
        return `${points} ${pointsLabel} a cada ${formatedValue}`;
    }

    // Ex: "1 ponto a cada 50 PIX"
    return `${points} ${pointsLabel} a cada ${reference} ${itemLabel}`;
}

export function calculatePoints(quantity: number, factor: PontuacaoRegrasJSON) {
        const points = factor.pontos;
        const reference = factor.valor;

        if (!reference || reference === 0) return 0;

        const total = (quantity * points) / reference;

        return Math.floor(total + 0.0001);
    }