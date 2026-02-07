'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import OperatorsModal from '@/components/OperatorsModal';
import { PaginatedBar } from '@/components/PaginatedBar';
import OperatorsTable from '@/components/Operators/OperatorsTable';
import useOperators from '@/hooks/useOperators';


export default function OperadoresPage() {
    const {
        onCreate,
        filtro,
        setFiltro,
        itemsPerPage,
        onChange,
        currentPage,
        totalPages,
        setCurrentPage,
        loading,
        paginatedData,
        onEdit,
        onToggle,
        filteredOps,
        isOpen,
        onClose,
        formData,
        setFormData,
        isEditing,
        onSave
    } = useOperators();


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gerenciar Operadores</h1>
                <button
                    onClick={onCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Plus size={20} /> Novo Operador
                </button>
            </div>

            {/* Barra de Busca */}
            <SearchInput
                value={filtro}
                placeholder='Buscar por nome ou matrícula...'
                onChange={setFiltro}
            />

            {/* Seletor de Itens por Página */}
            <PaginatedBar
                itemsPerPage={itemsPerPage}
                onChange={onChange}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage} 
            />

            {/* Tabela */}
            <OperatorsTable
                loading={loading}
                operators={paginatedData}
                onEdit={onEdit}
                onToggle={onToggle}
                filteredOps={filteredOps}
            />
            

            {/* --- MODAL --- */}
            <OperatorsModal
                isOpen={isOpen}
                onClose={onClose}
                formData={formData}
                setFormData={setFormData}
                onSave={onSave}
                isEdit={!!isEditing}
                lockMatricula= {!!isEditing}
            />
            
        </div>
    );
}