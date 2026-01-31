// src/components/DiasEspeciaisInput.tsx
import React, { useState } from 'react';
import { Trash, Plus, Calendar } from 'lucide-react';
import {DiaEspecial, DiasEspeciaisInputProps} from '@/types'; // Importe a interface que criamos antes


export default function DiasEspeciaisInput({ dias = [], onChange }: DiasEspeciaisInputProps) {
    const [novoData, setNovoData] = useState('');
    const [novoFator, setNovoFator] = useState(2);

    const handleAdd = () => {
        if (!novoData) return;
        const novo: DiaEspecial = { data: novoData, fator: Number(novoFator) };
        onChange([...dias, novo]);
        setNovoData('');
        setNovoFator(2);
    };

    const handleRemove = (index: number) => {
        const novaLista = [...dias];
        novaLista.splice(index, 1);
        onChange(novaLista);
    };

    return (
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 md:col-span-2">
            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600"/> Dias Especiais & Ofertas
            </h4>

            <p className="text-xs text-slate-500 mb-3">
                Defina datas específicas onde a pontuação será multiplicada.
            </p>

            {/* Lista */}
            <div className="space-y-2 mb-4 max-h-[150px] overflow-y-auto pr-1">
                {dias.length === 0 && (
                    <div className="text-sm text-slate-400 italic bg-slate-50 p-2 rounded text-center border border-dashed">
                        Nenhuma data configurada.
                    </div>
                )}
                {dias.map((dia, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-100 text-sm">
                        <div className="flex gap-3">
                            <span className="font-bold text-slate-700">
                                {new Date(dia.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </span>
                            <span className="bg-white px-2 rounded border text-slate-500 text-xs flex items-center">
                                x{dia.fator}
                            </span>
                        </div>
                        <button onClick={() => handleRemove(idx)} className="text-red-400 hover:text-red-600">
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Inputs de Adição */}
            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500">Data</label>
                    <input
                        type="date"
                        className="w-full p-2 border rounded text-sm"
                        value={novoData}
                        onChange={e => setNovoData(e.target.value)}
                    />
                </div>
                <div className="w-20">
                    <label className="text-xs font-bold text-slate-500">Mult.</label>
                    <input
                        type="number" step="0.5" min="1"
                        className="w-full p-2 border rounded text-sm"
                        value={novoFator}
                        onChange={e => setNovoFator(Number(e.target.value))}
                    />
                </div>
                <button
                    onClick={handleAdd}
                    disabled={!novoData}
                    className="bg-blue-600 text-white p-2 rounded w-[38px] h-[38px] flex items-center justify-center disabled:opacity-50"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
}