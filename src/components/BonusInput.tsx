// src/components/BonusInput.tsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import {BonusInputProps} from "@/types";


export default function BonusInput({
                                       meta,
                                       premio,
                                       onMetaChange,
                                       onPremioChange,
                                       labelMeta,
                                       unitMeta,
                                       stepMeta = 1
                                   }: BonusInputProps) {
    return (
        <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-end gap-3">

            {/* Lado Esquerdo: META */}
            <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-600 mb-1">{labelMeta}</label>
                <div className="flex items-center gap-2 bg-white p-1 border rounded focus-within:ring-1 focus-within:ring-blue-400">
                    <input
                        type="number"
                        min="0"
                        step={stepMeta}
                        className="w-full p-1 text-center font-bold text-slate-700 outline-none"
                        value={meta}
                        onChange={e => onMetaChange(Number(e.target.value))}
                    />
                    {unitMeta && <span className="text-xs text-slate-400 font-medium pr-2 whitespace-nowrap">{unitMeta}</span>}
                </div>
            </div>

            {/* Ícone de Seta */}
            <div className="text-slate-400 hidden sm:flex pb-2">
                <ArrowRight size={20} />
            </div>

            {/* Lado Direito: PRÊMIO */}
            <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-blue-600 mb-1">Prêmio (Pontos)</label>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-1 rounded focus-within:ring-1 focus-within:ring-blue-400">
                    <input
                        type="number"
                        min="0"
                        className="w-full p-1 text-center font-bold text-blue-700 bg-transparent outline-none"
                        value={premio}
                        onChange={e => onPremioChange(Number(e.target.value))}
                    />
                    <span className="text-xs text-blue-500 font-medium pr-2">pts</span>
                </div>
            </div>
        </div>
    );
}