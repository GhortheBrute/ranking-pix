'use client';

import React from 'react';
import { Calculator, Edit, Gift, Plus, Save, Trophy, X } from 'lucide-react';
import { RegrasModalProps } from "@/types";
import RuleInput from '@/components/Rules/RuleInput';
import BonusInput from "@/components/Rules/BonusInput";
import DiasEspeciaisInput from "@/components/Rules/DiasEspeciaisInput";


export default function RegrasModal({
    isOpen,
    onClose,
    editId,
    activeTab,
    setActiveTab,
    formName,
    setFormName,
    formRegras,
    setFormRegras,
    onSave,
    updateRuleValue,
}: RegrasModalProps & { updateRuleValue: (c: any, i: string, s: string, f: string, v: number ) => void }) {

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header Modal */}
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        {editId ? <Edit size={20} /> : <Plus size={20} />}
                        {editId ? 'Editar Modelo' : 'Novo Modelo de Regras'}
                    </h2>
                    <button onClick={onClose}><X className="hover:text-red-400" /></button>
                </div>

                {/* Corpo com Scroll */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

                    {/* Nome do Modelo */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Modelo</label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex: Regra Padrão 2025..."
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                        />
                    </div>

                    {/* ABAS DE NAVEGAÇÃO */}
                    <div className="flex border-b border-gray-300 mb-6">
                        <button
                            onClick={() => setActiveTab('financeiro')}
                            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'financeiro' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Calculator size={18} /> Financeiro
                        </button>
                        <button
                            onClick={() => setActiveTab('gamificacao')}
                            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'gamificacao' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Trophy size={18} /> Gamificação
                        </button>
                        <button
                            onClick={() => setActiveTab('premios')}
                            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'premios' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Gift size={18} /> Prêmios
                        </button>
                    </div>

                    {/* CONTEÚDO DAS ABAS */}
                    <div className="space-y-6">

                        {/* ABA FINANCEIRO */}
                        {activeTab === 'financeiro' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                {/* Bloco PIX */}
                                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                    <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Pix</h4>
                                    <div className="space-y-4">
                                        <RuleInput
                                            labelPontos="Pontos"
                                            labelReferencia="PIX"
                                            points={formRegras.pontuacao.pix.qtd.pontos}
                                            reference={formRegras.pontuacao.pix.qtd.valor}
                                            onChangePoints={(v) => updateRuleValue('pontuacao', 'pix', 'qtd', 'pontos', v)}
                                            onChangeReference={(v) => updateRuleValue('pontuacao', 'pix', 'qtd', 'valor', v)}
                                        />
                                        <RuleInput
                                            labelPontos="Pontos"
                                            labelReferencia="Reais (R$)"
                                            step={10}
                                            points={formRegras.pontuacao.pix.monetario.pontos}
                                            reference={formRegras.pontuacao.pix.monetario.valor}
                                            onChangePoints={(v) => updateRuleValue('pontuacao', 'pix', 'monetario', 'pontos', v)}
                                            onChangeReference={(v) => updateRuleValue('pontuacao', 'pix', 'monetario', 'valor', v)}
                                        />
                                    </div>
                                </div>

                                {/* Bloco RECARGA */}
                                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                    <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Recarga</h4>
                                    <div className="space-y-4">
                                        <RuleInput
                                            labelPontos="Pontos"
                                            labelReferencia="Recargas"
                                            points={formRegras.pontuacao.recarga.qtd.pontos}
                                            reference={formRegras.pontuacao.recarga.qtd.valor}
                                            onChangePoints={(v) => updateRuleValue('pontuacao', 'recarga', 'qtd', 'pontos', v)}
                                            onChangeReference={(v) => updateRuleValue('pontuacao', 'recarga', 'qtd', 'valor', v)}
                                        />
                                        <RuleInput
                                            labelPontos="Pontos"
                                            labelReferencia="Reais (R$)"
                                            step={15}
                                            points={formRegras.pontuacao.recarga.monetario.pontos}
                                            reference={formRegras.pontuacao.recarga.monetario.valor}
                                            onChangePoints={(v) => updateRuleValue('pontuacao', 'recarga', 'monetario', 'pontos', v)}
                                            onChangeReference={(v) => updateRuleValue('pontuacao', 'recarga', 'monetario', 'valor', v)}
                                        />
                                    </div>
                                </div>

                                {/* Componente Modularizado de Dias Especiais */}
                                <DiasEspeciaisInput
                                    dias={formRegras.pontuacao.dias_especiais || []}
                                    onChange={(novosDias) => setFormRegras(prev => ({
                                        ...prev,
                                        pontuacao: { ...prev.pontuacao, dias_especiais: novosDias }
                                    }))}
                                />
                            </div>
                        )}

                        {/* ABA GAMIFICAÇÃO */}
                        {activeTab === 'gamificacao' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                {/* PIX Bônus */}
                                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                    <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Pix (Bônus)</h4>
                                    <div className="space-y-4">
                                        <BonusInput
                                            labelMeta="Meta de Volume"
                                            unitMeta="transações"
                                            meta={formRegras.bonus.pix.qtd.meta}
                                            premio={formRegras.bonus.pix.qtd.pontos}
                                            onMetaChange={v => updateRuleValue('bonus', 'pix', 'qtd', 'meta', v)}
                                            onPremioChange={v => updateRuleValue('bonus', 'pix', 'qtd', 'pontos', v)}
                                        />
                                        <BonusInput
                                            labelMeta="Meta de Valor"
                                            unitMeta="R$"
                                            stepMeta={50}
                                            meta={formRegras.bonus.pix.monetario.meta}
                                            premio={formRegras.bonus.pix.monetario.pontos}
                                            onMetaChange={v => updateRuleValue('bonus', 'pix', 'monetario', 'meta', v)}
                                            onPremioChange={v => updateRuleValue('bonus', 'pix', 'monetario', 'pontos', v)}
                                        />
                                    </div>
                                </div>

                                {/* Recarga Bônus */}
                                <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                    <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Recarga (Bônus)</h4>
                                    <div className="space-y-4">
                                        <BonusInput
                                            labelMeta="Meta de Volume"
                                            unitMeta="recargas"
                                            meta={formRegras.bonus.recarga.qtd.meta}
                                            premio={formRegras.bonus.recarga.qtd.pontos}
                                            onMetaChange={v => updateRuleValue('bonus', 'recarga', 'qtd', 'meta', v)}
                                            onPremioChange={v => updateRuleValue('bonus', 'recarga', 'qtd', 'pontos', v)}
                                        />
                                        <BonusInput
                                            labelMeta="Meta de Valor"
                                            unitMeta="R$"
                                            stepMeta={15}
                                            meta={formRegras.bonus.recarga.monetario.meta}
                                            premio={formRegras.bonus.recarga.monetario.pontos}
                                            onMetaChange={v => updateRuleValue('bonus', 'recarga', 'monetario', 'meta', v)}
                                            onPremioChange={v => updateRuleValue('bonus', 'recarga', 'monetario', 'pontos', v)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ABA PRÊMIOS */}
                        {activeTab === 'premios' && (
                            <h1>🏗️ Em construção</h1>
                        )}
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-gray-200 rounded font-medium">
                        Cancelar
                    </button>
                    <button onClick={onSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex items-center gap-2 shadow-lg">
                        <Save size={18} /> Salvar Modelo
                    </button>
                </div>
            </div>
        </div>
    );
}