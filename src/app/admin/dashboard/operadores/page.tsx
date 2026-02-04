'use client';

import React, {useState, useEffect, useMemo} from 'react';
import {
    Plus,
    Edit,
    UserX,
    UserCheck,
    X,
    Save
} from 'lucide-react';
import { Operador } from '@/types';
import { fetchOperadoresData, saveOperador, ToggleOperador } from '@/services/api';
import SearchInput from '@/components/SearchInput';
import { ItemSizeSelect } from '@/components/ItemSizeSelector';
import { PaginatedButtons } from '@/components/PaginatedButtons';


export default function OperadoresPage() {
    const [operadores, setOperadores] = useState<Operador[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ matricula: '', nome: '', apelido: '' });

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);



    // 1. Carregar Dados
    const fetchOperadores = async () => {
        try {
            const data = await fetchOperadoresData();
            setOperadores(data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar operadores:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperadores();
    }, []);

    // 2. Manipular Modal (Abrir para Criar vs Abrir para Editar)
    const handleOpenCreate = () => {
        setFormData({ matricula: '', nome: '', apelido: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (op: Operador) => {
        setFormData({
            matricula: op.matricula.toString(),
            nome: op.nome,
            apelido: op.apelido || ''
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // 3. Salvar (Form Submit)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                is_edit: isEditing
            };

            const data = await saveOperador(payload);

            if (data.sucesso) {
                fetchOperadores(); // Recarrega a tabela
                setIsModalOpen(false); // Fecha modal
            } else {
                alert(data.error || 'Erro ao salvar');
            }
        } catch (error) {
            alert('Erro de conexão: ' + error);
        }
    };

    // 4. Toggle Status (Ativar/Desativar)
    const handleToggleStatus = async (matricula: string) => {
        if (!confirm('Deseja alterar o status deste operador?')) return;
        await ToggleOperador('toggle_status', Number(matricula));
        await fetchOperadores();
    };

    // Filtro de busca no front
    const filteredOps = operadores.filter(op =>
        op.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        op.matricula.toString().includes(filtro)
    );

    // Configura a paginação dos dados
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOps.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, filteredOps, itemsPerPage]);

    const totalPages = Math.ceil(filteredOps.length / itemsPerPage);

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Volta para a primeira página para não quebrar o visual
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gerenciar Operadores</h1>
                <button
                    onClick={handleOpenCreate}
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
            <ItemSizeSelect
                itemsPerPage={itemsPerPage}
                onChange={handleItemsPerPageChange}
                currentPage={currentPage}
                totalPages={totalPages}
            />
            <div className="mb-2 text-sm text-gray-600  uppercase flex flex-col md:flex-row justify-between items-end gap-2 no-print">
                {/*<div className="flex items-center gap-2">
                    <label htmlFor="rows" className="text-xs font-bold">Exibir:</label>
                    <select
                        id="rows"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="border rounded p-1 text-xs bg-white  text-black  focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                    </select>
                </div>
                <span>Página <span className="font-bold text-black ">{currentPage}</span> de <span className="font-bold">{totalPages || 1}</span></span>
                */}
                {/* Botões de Paginação */}
                <PaginatedButtons
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                />
                {/*{totalPages > 1 && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-200 rounded text-xs font-bold disabled:opacity-50 hover:bg-gray-300"
                        >
                            ANTERIOR
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-200 rounded text-xs font-bold disabled:opacity-50 hover:bg-gray-300 "
                        >
                            PRÓXIMA
                        </button>
                    </div>
                )} */}
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="p-4">Matrícula</th>
                        <th className="p-4">Nome</th>
                        <th className="p-4">Apelido</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
                    ) : paginatedData.map(op => (
                        <tr key={op.matricula} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono text-slate-500">{op.matricula}</td>
                            <td className="p-4 font-medium text-slate-800">{op.nome}</td>
                            <td className="p-4 text-slate-600">{op.apelido || '-'}</td>
                            <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${op.valido ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {op.valido ? 'ATIVO' : 'INATIVO'}
                                    </span>
                            </td>
                            <td className="p-4 text-right flex justify-end gap-2">
                                <button
                                    onClick={() => handleOpenEdit(op)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(op.matricula)}
                                    className={`p-2 rounded ${op.valido ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                    title={op.valido ? "Desativar" : "Ativar"}
                                >
                                    {op.valido ? <UserX size={18} /> : <UserCheck size={18} />}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredOps.length === 0 && !loading && (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhum operador encontrado.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg">
                                {isEditing ? 'Editar Operador' : 'Novo Operador'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula</label>
                                <input
                                    type="number"
                                    required
                                    disabled={isEditing} // Não pode mudar matrícula na edição
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                                    value={formData.matricula}
                                    onChange={e => setFormData({...formData, matricula: e.target.value})}
                                />
                                {isEditing && <p className="text-xs text-gray-400 mt-1">A matrícula não pode ser alterada.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.nome}
                                    onChange={e => setFormData({...formData, nome: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Apelido (Para o Ranking)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: Zé do Caixa 1"
                                    value={formData.apelido}
                                    onChange={e => setFormData({...formData, apelido: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center gap-2"
                                >
                                    <Save size={18} /> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}