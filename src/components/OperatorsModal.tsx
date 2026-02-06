import { OperatorModalProps } from "@/types";
import { Save, X } from "lucide-react";

export default function OperatorsModal({
    isOpen,
    onClose,
    onSave,
    formData,
    setFormData,
    isEdit = false,
    lockMatricula = false
}: OperatorModalProps) {

    if (!isOpen) return null;

    const modalTitle = isEdit ? "Editar Operador" : "Novo Operador";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* CABEÇALHO */}
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">
                        {modalTitle}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula</label>
                        <input
                            type="number"
                            required
                            readOnly={lockMatricula}
                            className={`w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500 ${
                                lockMatricula ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                            }`}
                            value={formData.matricula}
                            onChange={e => setFormData({...formData, matricula: e.target.value})}
                        />
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
    )
}