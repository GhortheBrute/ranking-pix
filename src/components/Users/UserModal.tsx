import { UserModalProps } from "@/types";
import { Save, X } from "lucide-react";

export function UserModal({
    isOpen,
    onClose,
    isEditing,
    formData,
    setFormData,
    onSave
}: UserModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">
                        {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSave} className="p-6 space-y-4">
                    {/* Campo USERNAME */}
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

                    {/* Campo PASSWORD */}
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

                    {/* Campo de ROLE */}
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
                            onClick={onClose}
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
    );
}