import { OperadoresTableProps } from "@/types";
import { Edit, UserX, UserCheck, AlertCircle } from "lucide-react";

export function OperadoresTable({loading, paginatedData, handleOpenEdit, handleToggleStatus, filteredOps}: OperadoresTableProps) {

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-slate-100 p-6 rounded-xl h-64 animate-pulse border-l-4 border-slate-200">
                        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (filteredOps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                <AlertCircle size={48} className="mb-2 opacity-50" />
                <p className="font-medium">Nenhum operador encontrado.</p>
                <p className="text-sm">Crie um novo operador para começar.</p>
            </div>
        );
    }

    return (
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
                                onClick={(op) => handleOpenEdit(op)}
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
    )
}