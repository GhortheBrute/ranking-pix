'use client';

import React, {useState, useEffect, useMemo} from 'react';
import { Plus, Edit, UserX, UserCheck, X, Save, Search } from 'lucide-react';

interface Usuario {
    id: number;
    username: string;
    role: 'admin' | 'user';
    ativo: number; // Adicionei ativo para o toggle funcionar
}

export default function UsersPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    // Role padrão como 'user'
    const [formData, setFormData] = useState({ id: 0, username: '', password: '', role: 'user' });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const fetchUsuarios = async () => {
        try {
            const res = await fetch('/api/usuarios.php');
            const data = await res.json();
            setUsuarios(data);
        } catch (error) {
            console.error('Erro ao buscar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleOpenCreate = () => {
        setFormData({ id: 0, username: '', password: '', role: 'user' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: Usuario) => {
        setFormData({
            id: user.id,
            username: user.username,
            password: '', // IMPORTANTE: Começa vazio. Só envia se quiser trocar.
            role: user.role || 'user'
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                is_edit: isEditing
            };

            const res = await fetch('/api/usuarios.php', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.sucesso) {
                fetchUsuarios();
                setIsModalOpen(false);
            } else {
                alert(data.erro || 'Erro ao salvar');
            }
        } catch (error) {
            alert('Erro de conexão');
        }
    };

    const filteredUsers = usuarios.filter(u =>
        u.username.toLowerCase().includes(filtro.toLowerCase()) ||
        u.id.toString().includes(filtro)
    );

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, filteredUsers, itemsPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gerenciar Usuários</h1>
                <button
                    onClick={handleOpenCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={20} /> Novo Usuário
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 flex items-center gap-2">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar usuário..."
                    className="flex-1 outline-none text-slate-700"
                    value={filtro}
                    onChange={e => setFiltro(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="p-4 w-16">ID</th>
                        <th className="p-4">Username</th>
                        <th className="p-4">Role</th>
                        <th className="p-4 text-right">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
                    ) : paginatedData.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono text-slate-500">{user.id}</td>
                            <td className="p-4 font-medium text-slate-800">{user.username}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {user.role ? user.role.toUpperCase() : 'USER'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button
                                    onClick={() => handleOpenEdit(user)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
             {/* Paginação simples aqui se desejar manter */}
            
            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg">
                                {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                                </label>
                                <input
                                    type="password"
                                    // Apenas obrigatório se NÃO estiver editando
                                    required={!isEditing}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    placeholder={isEditing ? "******" : ""}
                                />
                            </div>

                            {/* Campo de ROLE que faltava */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Permissão (Role)</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="user">Usuário Comum</option>
                                    <option value="admin">Administrador</option>
                                </select>
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