'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { UsersTable } from '@/components/Users/UsersTable';
import { UserModal } from '@/components/Users/UserModal';
import SearchInput from '@/components/SearchInput';
import { PaginatedBar } from '@/components/PaginatedBar';
import useUsers from '@/hooks/useUsers';

export default function UsersPage() {
    const {
        // Dados da tabela
        usuarios,
        loading,

        // Controle de Busca
        filtro,
        setFiltro,

        // Paginação
        pagination,

        // Modal e Formulário
        modal,
        formData,
        setFormData,
        handleSave
    } = useUsers();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gerenciar Usuários</h1>
                <button
                    onClick={modal.openCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={20} /> Novo Usuário
                </button>
            </div>

            {/* BARRA DE PESQUISA */}
            <SearchInput
                value={filtro}
                onChange={setFiltro}
            />

            {/* Paginação simples aqui se desejar manter */}
            <PaginatedBar
                itemsPerPage={pagination.itemsPerPage}
                onChange={pagination.handleItemsPerPageChange}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                setCurrentPage={pagination.setCurrentPage}
            />

            {/* TABELA DE USUÁRIOS */}
            <UsersTable
                loading={loading}
                users={usuarios}
                onEdit={modal.openEdit}
            />
            
            {/* MODAL */}
            <UserModal
                isOpen={modal.isOpen}
                onClose={modal.close}
                isEditing={modal.isEditing}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
            />
        </div>
    );
}