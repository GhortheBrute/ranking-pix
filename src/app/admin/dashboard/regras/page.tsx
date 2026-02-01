'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useRegras } from '@/hooks/useRegras';
import RegrasLista from '@/components/RegrasLista';
import RegrasModal from '@/components/RegrasModal';

export default function RegrasPage() {
    // 1. Conectamos o "Cérebro" (Hook)
    const {
        // Dados da Lista
        modelos,
        loading,
        
        // Controle de Estado da UI
        isModalOpen,
        setIsModalOpen,
        editId,
        activeTab,
        setActiveTab,
        
        // Dados do Formulário
        formNome,
        setFormNome,
        formRegras,
        setFormRegras,
        
        // Ações / Funções
        handleOpenModal,
        handleSave,
        handleToggle,
        updateRegra,
        updateBool
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
                    onClick={() => handleOpenModal()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Novo Modelo
                </button>
            </div>

            {/* 3. Componente de Listagem */}
            <RegrasLista 
                loading={loading}
                modelos={modelos}
                onEdit={handleOpenModal} // Passamos a função que o hook nos deu
                onToggle={handleToggle}
            />

            {/* 4. Componente de Modal (Formulário) */}
            <RegrasModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)} // Função simples para fechar
                
                // Dados de Controle
                editId={editId}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                
                // Dados do Formulário
                formName={formNome}
                setFormName={setFormNome}
                formRegras={formRegras}
                setFormRegras={setFormRegras}
                
                // Ações do Formulário
                onSave={handleSave}
                updateRegra={updateRegra}
                updateBool={updateBool}
            />
        </div>
    );
}