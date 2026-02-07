'use client';

import { PesquisaFormProps } from '@/types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { OperadorSelect } from '@/components/OperadorSelect';

export function PesquisaForm({
    torneio,
    itens,
    loading,
    selectedOperador,
    setSelectedOperador,
    onBack,
    onAddOperador,
    onUpdateQuantidade,
    onRemove,
    onSave,
    todosOperadores
}: PesquisaFormProps) {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* CABEÇALHO COM BOTÃO VOLTAR */}
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Lançar Pesquisa</h2>
                    <p className="text-sm text-blue-600 font-medium">{torneio.nome}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* LISTAGEM (As linhas que viram colunas) */}
                <div className="divide-y divide-gray-100">
                    {itens.map((item, index) => (
                        <div key={item.matricula} className="p-4 flex items-center gap-4 group hover:bg-slate-50 transition">

                            {/* Coluna 1: Nome (ReadOnly) */}
                            <div className="flex-1">
                                <span className="font-bold text-slate-700 block">{item.nome}</span>
                                <span className="text-xs text-gray-400 font-mono">#{item.matricula}</span>
                            </div>

                            {/* Coluna 2: Input Quantidade */}
                            <div className="w-32">
                                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Qtd.</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-right font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    onFocus={(e) => e.target.select()}
                                    value={item.quantidade | 0}
                                    onChange={(e) => onUpdateQuantidade(index, e.target.value)}
                                />
                            </div>

                            {/* Coluna 3: Delete Button */}
                            <button
                                onClick={() => onRemove(index)}
                                className="text-gray-300 hover:text-red-500 p-2 transition"
                                title="Remover da lista"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {itens.length === 0 && (
                        <div className="p-8 text-center text-gray-400 italic">
                            Nenhum operador lançado ainda. Adicione abaixo.
                        </div>
                    )}
                </div>

                {/* AREA DE ADICIONAR (Headless UI Combobox) */}
                <div className="bg-slate-50 p-4 border-t border-gray-200">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Adicionar Operador</label>
                    <div className="flex gap-2">

                        <div className="relative flex-1">
                            <OperadorSelect
                                value={selectedOperador}
                                onChange={setSelectedOperador}
                                todosOperadores={todosOperadores}
                                excluirIds={itens.map(i => i.matricula)}
                            />
                        </div>

                        <button
                            onClick={onAddOperador}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition"
                        >
                            Adicionar
                        </button>
                    </div>
                </div>

                {/* Footer de Ações */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onSave}
                        disabled={loading}
                        className="mb-2 mr-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md font-bold flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <Save size={20} />
                        {loading ? 'Salvando...' : 'Salvar Lançamentos'}
                    </button>
                </div>
            </div>
        </div>
    );
}