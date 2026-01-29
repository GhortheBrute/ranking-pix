'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, Calculator, Trophy, Gift, Power } from 'lucide-react';
import {ModeloRegra, RegrasJSON} from "@/types";


// Valor padrão para novos modelos
const REGRAS_DEFAULT: RegrasJSON = {
    pontuacao: {
        fator_qtd_pix: 1,
        fator_valor_pix: 0.00,
        fator_qtd_recarga: 0,
        fator_valor_recarga: 15.00,
        peso_fds: 1,
        fator_qtd_pesquisas: 0
    },
    bonus: {
        meta_pix_qtd: 0,
        meta_pix_valor: 0.00,
        pontos_bonus_pix_qtd: 0,
        pontos_bonus_pix_valor: 0.00,
        meta_recarga_qtd: 0,
        meta_recarga_valor: 0.00,
        pontos_bonus_recarga_qtd: 0,
        pontos_bonus_recarga_valor: 0.00,
        meta_pesquisa: 0,
        pontos_bonus_pesquisa: 0
    },
    premios: {
        ativar_roleta: false,
        pontos_para_roleta: 1000
    }
};

// TODO: implementar regras para pesquisas, utilizando a interface global.
// TODO: Alterar regra de bônus de fim de semana para data específica.
export default function RegrasPage() {
    const [modelos, setModelos] = useState<ModeloRegra[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal e Edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'financeiro' | 'gamificacao' | 'premios'>('financeiro');
    
    // Estado do Formulário (Nome + JSON separado)
    const [editId, setEditId] = useState<number | null>(null);
    const [formNome, setFormNome] = useState('');
    const [formRegras, setFormRegras] = useState<RegrasJSON>(REGRAS_DEFAULT);

    // 1. Carregar Lista
    const fetchModelos = async () => {
        try {
            const res = await fetch('/api/regras.php');
            const data = await res.json();
            
            // Garante que o campo 'regras' seja um objeto, mesmo que venha string do PHP
            const formatado = data.map((m: any) => ({
                ...m,
                regras: typeof m.regras === 'string' ? JSON.parse(m.regras) : m.regras
            }));
            
            setModelos(formatado);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchModelos(); }, []);

    // 2. Abrir Modal (Criar ou Editar)
    const handleOpenModal = (modelo?: ModeloRegra) => {
        if (modelo) {
            // Edição
            setEditId(modelo.id);
            setFormNome(modelo.nome);
            setFormRegras(typeof modelo.regras === 'string' ? JSON.parse(modelo.regras) : modelo.regras);
        } else {
            // Novo
            setEditId(null);
            setFormNome('');
            setFormRegras(REGRAS_DEFAULT);
        }
        setActiveTab('financeiro');
        setIsModalOpen(true);
    };

    // 3. Salvar
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                id: editId, // Se for null, o PHP ignora (insert)
                nome: formNome,
                regras: formRegras,
                is_edit: !!editId // true se tiver ID
            };

            const res = await fetch('/api/regras.php', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                await fetchModelos();
                setIsModalOpen(false);
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro de conexão');
        }
    };

    // 4. Toggle Ativo/Inativo
    const handleToggle = async (id: number) => {
        if(!confirm('Deseja alterar o status deste modelo?')) return;
        await fetch('/api/regras.php', {
            method: 'POST',
            body: JSON.stringify({ acao: 'toggle_status', id })
        });
        await fetchModelos();
    };

    // Função auxiliar para atualizar o JSON aninhado
    const updateRegra = (section: keyof RegrasJSON, field: string, value: any) => {
        setFormRegras(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: Number(value) // Força número para evitar erro de cálculo
            }
        }));
    };
    
    // Atualiza booleano
    const updateBool = (section: keyof RegrasJSON, field: string, value: boolean) => {
        setFormRegras(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };



    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Modelos de Regras</h1>
                    <p className="text-slate-500">Crie predefinições de pontuação para seus torneios.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={20} /> Novo Modelo
                </button>
            </div>

            {/* LISTAGEM */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modelos.map(m => (
                    <div key={m.id} className={`bg-white p-6 rounded-xl border-l-4 shadow-sm ${m.ativo ? 'border-green-500' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-slate-800">{m.nome}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${m.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {m.ativo ? 'ATIVO' : 'INATIVO'}
                            </span>
                        </div>
                        
                        {/* Resumo rápido das regras */}
                        <div className="text-sm text-slate-500 space-y-1 mb-6">
                            <p>Quantidade de Pix: <b className="text-slate-700">1 Ponto a cada {(m.regras as RegrasJSON).pontuacao.fator_qtd_pix} PIX</b></p>
                            <p>Valor de Pix: <b className="text-slate-700">1 Ponto a cada R$ {(m.regras as RegrasJSON).pontuacao.fator_valor_pix} em PIX </b></p>
                            <br />
                            <p>Quantidade de Recarga: <b className="text-slate-700">1 Ponto a cada {(m.regras as RegrasJSON).pontuacao.fator_qtd_recarga} Recargas</b></p>
                            <p>Valor de Recarga: <b className="text-slate-700">1 Ponto a cada R$ {(m.regras as RegrasJSON).pontuacao.fator_valor_recarga} em Recarga</b></p>
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                             <button onClick={() => handleToggle(m.id)} className="p-2 text-slate-400 hover:text-slate-600" title="Ativar/Desativar">
                                <Power size={18} className={`font-bold ${m.ativo ? 'text-red-800' : 'text-green-700'}`} />
                            </button>
                            <button onClick={() => handleOpenModal(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1">
                                <Edit size={18} /> Editar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE EDIÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        
                        {/* Header Modal */}
                        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                {editId ? <Edit size={20}/> : <Plus size={20}/>}
                                {editId ? 'Editar Modelo' : 'Novo Modelo de Regras'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="hover:text-red-400"/></button>
                        </div>

                        {/* Corpo com Scroll */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            
                            {/* Nome do Modelo */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Modelo</label>
                                <input 
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: Regra Padrão 2025, Regra Janeiro 2026, Especial Natal..."
                                    value={formNome}
                                    onChange={e => setFormNome(e.target.value)}
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
                                
                                {/* ABA 1: FINANCEIRO */}
                                {activeTab === 'financeiro' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                                        {/* PIX */}
                                        <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Pix</h4>
                                            <label className="block text-sm text-slate-600 mb-1">Pontos por Quantidade</label>
                                            <input type="number" step="0.1" className="w-full p-2 border rounded mb-3"
                                                value={formRegras.pontuacao.fator_qtd_pix}
                                                onChange={e => updateRegra('pontuacao', 'fator_qtd_pix', e.target.value)}
                                            />
                                            <label className="block text-sm text-slate-600 mb-1">Pontos por Valor(R$)</label>
                                            <input type="number" step="10" min="0" className="w-full p-2 border rounded mb-3"
                                                value={formRegras.pontuacao.fator_valor_pix.toFixed(2)}
                                                onChange={e => updateRegra('pontuacao', 'fator_valor_pix', e.target.value)}
                                            />
                                        </div>

                                        {/* RECARGA */}
                                        <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Recarga</h4>
                                            <label className="block text-sm text-slate-600 mb-1">Pontos por Quantidade</label>
                                            <input type="number" step="0.1" className="w-full p-2 border rounded mb-3"
                                                value={formRegras.pontuacao.fator_qtd_recarga}
                                                onChange={e => updateRegra('pontuacao', 'fator_qtd_recarga', e.target.value)}
                                            />
                                            <label className="block text-sm text-slate-600 mb-1">Pontos por Valor(R$)</label>
                                            <input type="number" step="15" min="0" className="w-full p-2 border rounded mb-3"
                                                value={formRegras.pontuacao.fator_valor_recarga.toFixed(2)}
                                                onChange={e => updateRegra('pontuacao', 'fator_valor_recarga', e.target.value)}
                                            />
                                        </div>

                                        {/* PESOS */}
                                        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 md:col-span-2">
                                            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Pesos Especiais</h4>
                                            <label className="block text-sm text-slate-600 mb-1">Multiplicador de Fim de Semana</label>
                                            <p className="text-xs text-slate-400 mb-2">Ex: 1,5 significa 50% a mais de pontos sáb/dom.</p>
                                            <input type="number" step="0.1" min="0" className="w-full p-2 border rounded"
                                                value={formRegras.pontuacao.peso_fds}
                                                onChange={e => updateRegra('pontuacao', 'peso_fds', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ABA 2: GAMIFICAÇÃO */}
                                {activeTab === 'gamificacao' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                                        {/* PIX */}
                                        
                                        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-4">
                                            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Pix</h4>
                                            <div className="grid grid-cols-2 gap-4">

                                                {/* Bônus por Volume */}
                                                <div>
                                                    <label className="block font-semibold text-sm text-slate-600">Bônus por Volume</label>
                                                    <label className="block text-sm text-slate-600">A cada (Qtd transações)</label>
                                                    <input type="number" min="0" className="w-full p-2 border rounded"
                                                        value={formRegras.bonus.meta_pix_qtd}
                                                        onChange={e => updateRegra('bonus', 'meta_pix_qtd', e.target.value)}
                                                    />
                                                    <label className="block text-sm text-slate-600">Ganha (Pontos Extras)</label>
                                                    <input type="number" min="0" className="w-full p-2 border rounded"
                                                        value={formRegras.bonus.pontos_bonus_pix_qtd}
                                                        onChange={e => updateRegra('bonus', 'pontos_bonus_pix_qtd', e.target.value)}
                                                    />
                                                </div>

                                                {/* Bônus por Valor Total */}
                                                <div>
                                                    <label className="block font-semibold text-sm text-slate-600">Bônus por Valor</label>
                                                    <label className="block text-sm text-slate-600">A cada R$ XXX,XX</label>
                                                    <input type="number" step="0.5" min="0" className="w-full p-2 border rounded"
                                                        value={formRegras.bonus.meta_pix_valor.toFixed(2)}
                                                        onChange={e => updateRegra('bonus', 'meta_pix_valor', e.target.value)}
                                                    />
                                                    <label className="block text-sm text-slate-600">Ganha (Pontos Extras)</label>
                                                    <input type="number" min="0" className="w-full p-2 border rounded"
                                                        value={formRegras.bonus.pontos_bonus_pix_valor}
                                                        onChange={e => updateRegra('bonus', 'pontos_bonus_pix_valor', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        

                                        {/* RECARGA */}
                                        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-4">
                                            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Recarga</h4>
                                            <div className="grid grid-cols-2 gap-4">

                                                {/* Bônus por Volume */}
                                                <div>
                                                    <label className="block font-semibold text-sm text-slate-600">Bônus por Volume</label>
                                                    <label className="block text-sm text-slate-600">A cada (Qtd de Recargas)</label>
                                                    <input type="number" min="0" className="w-full p-2 border rounded"
                                                        value={formRegras.bonus.meta_recarga_qtd}
                                                        onChange={e => updateRegra('bonus', 'meta_recarga_qtd', e.target.value)}
                                                    />
                                                    <label className="block text-sm text-slate-600">Ganha (Pontos Extras)</label>
                                                    <input type="number" min="0" className="w-full p-2 border rounded"
                                                        value={formRegras.bonus.pontos_bonus_recarga_qtd}
                                                        onChange={e => updateRegra('bonus', 'pontos_bonus_recarga_qtd', e.target.value)}
                                                    />
                                                </div>

                                                {/* Bônus por Valor */}
                                                <div>
                                                    <label className="block font-semibold text-sm text-slate-600">Bônus por Valor</label>
                                                    <label className="block text-sm text-slate-600">A cada (R$ acumulados)</label>
                                                    <input type="number" step="15" min="0" className="w-full p-2 border rounded"
                                                        value={formRegras.bonus.meta_recarga_valor.toFixed(2)}
                                                        onChange={e => updateRegra('bonus', 'meta_recarga_valor', e.target.value)}
                                                    />
                                                    <label className="block text-sm text-slate-600">Ganha (Pontos Extras)</label>
                                                    <input type="number" min="0" className="w-full p-2 border rounded"
                                                        value={formRegras.bonus.pontos_bonus_recarga_valor}
                                                        onChange={e => updateRegra('bonus', 'pontos_bonus_recarga_valor', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ABA 3: PRÊMIOS */}
                                {activeTab === 'premios' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2">
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded border border-purple-100 mb-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <input 
                                                    type="checkbox" 
                                                    id="checkRoleta"
                                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                                    checked={formRegras.premios.ativar_roleta}
                                                    onChange={e => updateBool('premios', 'ativar_roleta', e.target.checked)}
                                                />
                                                <label htmlFor="checkRoleta" className="font-bold text-slate-800">Ativar Sistema de Roleta/Sorteio</label>
                                            </div>
                                            
                                            <div className={`transition-opacity ${formRegras.premios.ativar_roleta ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                                <label className="block text-sm text-slate-600 mb-1">Pontos necessários para girar</label>
                                                <input type="number" step="100" min="0" className="w-full p-2 border rounded bg-white"
                                                    value={formRegras.premios.pontos_para_roleta}
                                                    onChange={e => updateRegra('premios', 'pontos_para_roleta', e.target.value)}
                                                />
                                                <p className="text-xs text-purple-600 mt-2">
                                                    * Quando o operador atingir essa pontuação, aparecerá um botão para ele resgatar um prêmio aleatório.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer Modal */}
                        <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-gray-200 rounded font-medium">
                                Cancelar
                            </button>
                            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex items-center gap-2 shadow-lg">
                                <Save size={18} /> Salvar Modelo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}