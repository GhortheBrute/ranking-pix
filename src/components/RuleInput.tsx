import {RuleInputProps} from "@/types";

export default function RuleInput({value, onChange}: RuleInputProps) {
    const handleChange = (novosPontos: number, novaReferencia: number) => {
        // Que cálculo fazemos aqui para enviar o valor correto ao pai?
        const novoFator = getFracaoInicial(novosPontos);
        onChange(novoFator);
    }

    function mdc(a: number, b: number): number { return b === 0 ? a : mdc(b, a % b); }

    function getFracaoInicial(fator: number) {
        const s = fator.toString();

        if (!s.includes('.')) return { numerador: fator, denominador: 1};

        const casas = s.split('.')[1].length;
        const denominador = 10 ** casas;
        const numerador = Math.round(fator * denominador);

        const divisor = mdc(fator, denominador);

        return {
            numerador: numerador / divisor,
            denominador: denominador / divisor,
        };
    }
}