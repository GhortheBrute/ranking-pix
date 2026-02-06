import { UsersTableProps } from '@/types';
import { Edit } from 'lucide-react';

export function UsersTable({ loading, users, onEdit}: UsersTableProps) {
    return (
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
                ) : users.map(user => (
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
                                onClick={() => onEdit(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Editar"
                            >
                                <Edit size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
                {!loading && users.length === 0 && (
                     <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                            Nenhum usuário encontrado.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}