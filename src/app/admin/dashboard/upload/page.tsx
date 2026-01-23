'use client';

import {FileType, CheckCircle, AlertCircle, Loader2, UploadCloud, X, Save} from 'lucide-react';
import React, {useEffect, useState} from 'react';


export default function UploadPage() {
    // Estados independentes para cada upload
    const [loadingPix, setLoadingPix] = useState(false);
    const [msgPix, setMsgPix] = useState({ type: '', text: ''});

    const [loadingRecarga, setLoadingRecarga] = useState(false);
    const [msgRecarga, setMsgRecarga] = useState({ type: '', text: ''});

    // Modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ matricula: '', nome: '', apelido: '' });
    const [filaIds, setFilaIds] = useState<string[]>([]);

    // Função genérica de upload
    const handleUpload = async (
        e: React.FormEvent,
        endpoint: string,
        fileInputName: string,
        setLoading: (v: boolean) => void,
        setMsg: (v: {type: string, text: string }) => void
    ) => {
        e.preventDefault();

        // Pega o arquivo do input
        const form = e.target as HTMLFormElement;
        const fileInput = form.elements.namedItem(fileInputName) as HTMLInputElement;

        if (!fileInput.files || fileInput.files.length === 0) {
            setMsg({ type: 'error', text: 'Selecione um arquivo CSV.'});
            return;
        }

        const file = fileInput.files[0];
        if (!file.name.endsWith('.csv')) {
            setMsg({ type: 'error', text: 'O arquivo deve ser .csv'});
            return;
        }

        setLoading(true);
        setMsg({ type: '', text: '' });

        // Monta o pacote de dados
        const formData = new FormData();
        formData.append(fileInputName, file);

        try{
            const res = await fetch(endpoint,{
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (data.success) {
                setMsg({ type: 'success', text: data.message });
                form.reset();
            } else if (data.error === 'operadores_inexistentes') {
                setFilaIds(data.ids);
            } else {
                setMsg({ type: 'error', text: data.error || 'Erro ao processar o arquivo' });
            }
        } catch (error) {
            console.error(error);
            setMsg({ type: 'error', text: 'Erro de conexão com o servidor.'});
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = (id: string) => {
        setFormData({ matricula: id, nome: '', apelido: '' });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                const payload = {
                    ...formData,
                };
    
                const res = await fetch('/api/operadores.php', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
    
                if (data.sucesso) {
                    setIsModalOpen(false); // Fecha modal

                    // Remove o primeiro item da fila e fará o useEffect rodar novamente.
                    setFilaIds((prev: string[]) => prev.slice(1));

                } else {
                    alert(data.erro || 'Erro ao salvar');
                }
            } catch (error) {
                alert('Erro de conexão');
        }
    };

    useEffect(() => {
        if (filaIds.length > 0 && !isModalOpen) {
            handleOpenCreate(filaIds[0]);
        }
    }, [filaIds, isModalOpen]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload de Dados</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* --- CARD PIX --- */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                            <FileType size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Importar Pix</h3>
                            <p className="text-sm text-slate-500">Arquivo CSV do relatório de Pix</p>
                        </div>
                    </div>

                    <form onSubmit={(e) => handleUpload(e, '/api/upload_pix.php', 'arquivo_pix_csv', setLoadingPix, setMsgPix)}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o arquivo</label>
                            <input 
                                type="file" 
                                name="arquivo_pix_csv" 
                                accept=".csv"
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {msgPix.text && (
                            <div className={`p-3 rounded mb-4 text-sm flex items-center gap-2 ${msgPix.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {msgPix.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {msgPix.text}
                            </div>
                        )}

                        <button 
                            disabled={loadingPix}
                            className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loadingPix ? <><Loader2 className="animate-spin" size={18}/> Enviando...</> : <><UploadCloud size={18}/> Enviar CSV Pix</>}
                        </button>
                    </form>
                </div>

                {/* --- CARD RECARGA --- */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                            <FileType size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Importar Recargas</h3>
                            <p className="text-sm text-slate-500">Arquivo CSV do relatório de Recarga</p>
                        </div>
                    </div>

                    <form onSubmit={(e) => handleUpload(e, '/api/upload_recarga.php', 'arquivo_recarga_csv', setLoadingRecarga, setMsgRecarga)}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o arquivo</label>
                            <input 
                                type="file" 
                                name="arquivo_recarga_csv" 
                                accept=".csv"
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {msgRecarga.text && (
                            <div className={`p-3 rounded mb-4 text-sm flex items-center gap-2 ${msgRecarga.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {msgRecarga.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {msgRecarga.text}
                            </div>
                        )}

                        <button 
                            disabled={loadingRecarga}
                            className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loadingRecarga ? <><Loader2 className="animate-spin" size={18}/> Enviando...</> : <><UploadCloud size={18}/> Enviar CSV Recarga</>}
                        </button>
                    </form>
                </div>

                {/* --- MODAL --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-white font-bold text-lg">
                                    Novo Operador
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
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
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
        </div>
    );
}