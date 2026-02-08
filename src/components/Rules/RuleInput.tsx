// src/components/RuleInput.tsx
import { RuleInputProps } from '@/types';
import React, { useState, useEffect } from 'react';


export default function RuleInput({
    values,
    onChangePoints,
    onChangeReference,
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
        if (values.pontos !== 0) { 
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPontos(values.pontos);
            setReferencia(values.valor);
        }
    }, []); // Array vazio = só roda na montagem (evita o "pulo")


    return (
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
             {/* Input Pontos */}
            <div className="flex items-center gap-1">
                <input 
                    type="number" 
                    min={min}
                    value={pontos}
                    onChange={(e) => onChangePoints(Number(e.target.value))}
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
                    onChange={(e) => onChangeReference(Number(e.target.value))}
                    className="w-[80px] p-1 border rounded text-center font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-400"
                />
                <span className="font-medium">{labelReferencia}</span>
            </div>
            
           
        </div>
    );
}