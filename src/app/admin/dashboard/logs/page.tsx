'use client';

import React from 'react';
import SearchInput from '@/components/SearchInput';
import TableLogs from '@/components/Logs/TableLogs';
import {useLogs} from '@/hooks/useLogs';


export default function LogsPage() {
    const {
        loading,
        filtro,
        setFiltro,
        filteredLogs,
        getBadgeColor
    } = useLogs();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Logs de Usuários</h1>
            </div>

            {/* BARRA DE PESQUISA */}
            <SearchInput
                value={filtro}
                placeholder='Buscar usuário por nome ou ID...'
                onChange={setFiltro}
            />

            {/* TABELA */}
            <TableLogs
                loading={loading}
                data={filteredLogs}
                getBadgeColor={getBadgeColor}
            />
        </div>
    );
}