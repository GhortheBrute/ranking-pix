'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useRegras } from '@/hooks/useRegras';
import RegrasLista from '@/components/Rules/RegrasLista';
import RegrasModal from '@/components/Rules/RegrasModal';
import { RegrasJSON } from '@/types';

export default function RegrasPage() {
    // 1. Conectamos o "Cérebro" (Hook)
    const {
        // Dados da Lista
        rules,
        loading,
        
        // Controle de Estado da UI
        modal,
        
        // Dados do Formulário
        form,
    } = useRegras();

    return (
        <div>
            {/* 2. Cabeçalho da Página */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Modelos de Regras</h1>
                    <p className="text-slate-500">Crie predefinições de pontuação para seus torneios.</p>
                </div>
                <button 
                    onClick={modal.openNew} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Novo Modelo
                </button>
            </div>

            {/* 3. Componente de Listagem */}
            <RegrasLista 
                loading={loading}
                modelos={rules}
                onEdit={modal.openEdit} // Passamos a função que o hook nos deu
                onToggle={modal.onToggle}
            />

            {/* 4. Componente de Modal (Formulário) */}
            <RegrasModal 
                isOpen={modal.isOpen}
                onClose={modal.close} // Função simples para fechar



                // Dados de Controle
                editId={form.editId}
                activeTab={modal.activeTab}
                setActiveTab={modal.setActiveTab}

                // Dados do Formulário
                formName={form.name}
                setFormName={form.setName}
                formRegras={form.rules}
                setFormRegras={form.setRules}

                // Ações do Formulário
                onSave={modal.save}
                updateRuleValue={form.updateRuleValue} 
                />
        </div>
    );
}