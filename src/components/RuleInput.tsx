// src/components/RuleInput.tsx
import { RuleInputProps } from '@/types';
import { getFracaoInicial } from '@/utils/math';
import React, { useState, useEffect } from 'react';


export default function RuleInput({
    value, onChange,
    labelPontos = "Pontos",
    labelReferencia = "Referência",
    step = 1,
    min = 0
}: RuleInputProps) {
    // 2. Estado Local (Visual)
    const [pontos, setPontos] = useState(0);
    const [referencia, setReferencia] = useState(0);

    // 3. Sincronização Inicial (Carregamento)
    // Roda apenas quando o componente monta OU quando o valor vem do banco pela primeira vez (sai de 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (value !== 0) { 
            const fracao = getFracaoInicial(value);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPontos(fracao.numerador);
            setReferencia(fracao.denominador);
        }
    }, ); // Array vazio = só roda na montagem (evita o "pulo")

    // 4. Lógica Central de Cálculo
    const calcularEEnviar = (p: number, r: number) => {
        if (r === 0) return; // Proteção contra divisão por zero
        const novoFator = p / r;
        onChange(novoFator);
    };

    // 5. Handlers Específicos (Opção B)
    const handlePontosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const novoP = Number(e.target.value);
        setPontos(novoP);           // Atualiza visual instantaneamente
        calcularEEnviar(novoP, referencia); // Usa o ESTADO da referência
    };

    const handleReferenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const novaRef = Number(e.target.value);
        setReferencia(novaRef);     // Atualiza visual instantaneamente
        calcularEEnviar(pontos, novaRef);   // Usa o ESTADO dos pontos
    };

    return (
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
             {/* Input Pontos */}
            <div className="flex items-center gap-1">
                <input 
                    type="number" 
                    min={min}
                    value={pontos}
                    onChange={handlePontosChange}
                    className="w-[80px] p-1 border rounded text-center font-bold text-blue-700 outline-none focus:ring-1 focus:ring-blue-400"
                />
                <span className="font-medium">{labelPontos}</span>
            </div>

            <span className="text-slate-400">a cada</span>
            {/* Input Referência */}
            <div className="flex items-center gap-1">
                <input 
                    type="number" 
                    min={min}
                    step={step}
                    value={referencia}
                    onChange={handleReferenciaChange}
                    className="w-[80px] p-1 border rounded text-center font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-400"
                />
                <span className="font-medium">{labelReferencia}</span>
            </div>
            
           
        </div>
    );
}