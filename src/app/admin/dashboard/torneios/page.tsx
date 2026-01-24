'use client';

import React, {useEffect, useState} from "react";

interface RegrasJSON {
    pontuacao: {
        fator_qtd_pix: number;
        fator_valor_pix: number;
        fator_qtd_recarga: number;
        fator_valor_recarga: number;
        peso_fds: number;
    };
    bonus: {
        meta_pix_qtd: number;     // Ex: A cada 10 pix
        meta_pix_valor: number;
        pontos_bonus_pix_qtd: number; // Ganha 50 pontos
        pontos_bonus_pix_valor: number; // Ganha 50 pontos
        meta_recarga_qtd: number;
        meta_recarga_valor: number; // Ex: A cada R$ 100
        pontos_bonus_recarga_qtd: number;
        pontos_bonus_recarga_valor: number;
    };
    premios: {
        ativar_roleta: boolean;
        pontos_para_roleta: number;
    };
}

// Estrutura do Modelo no Banco
interface ModeloRegra {
    id: number;
    nome: string;
    ativo: number;
    regras: RegrasJSON | string; // Pode vir como string do banco
}

interface TorneioProps {
    id: number;
    nome: string;
    data_inicio: string;
    data_fim: string;
    regra_id: number;
    regra_nome?: string;
    ativo: number; // Vem como número do banco
    criado_em: string;
}


export default function TorneioPage() {
    const [torneios, setTorneios] = useState<TorneioProps[]>([]);
    const [modelos, setModelos] = useState<ModeloRegra[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal e Edição
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado do Formulário
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({  nome: '', data_inicio: '', data_fim: '', regra_id: 1 });

    // Carrega a Lista
    const carregarDados = async () => {
        setLoading(true);
        try {
            const [resTorneios, resRegras] = await Promise.all([
                fetch(`/api/torneios.php`),
                fetch(`/api/regras.php`),
            ])
            const dataTorneios = await resTorneios.json();
            const dataRegras = await resRegras.json();

            const regrasFormatadas = dataRegras.map((m: any) => ({
                ...m,
                regras: typeof m.regras === 'string' ? JSON.parse(m.regras) : m.regras
            }));

            setTorneios(dataTorneios);
            setModelos(regrasFormatadas);
        } catch (error) {
            console.log('Erro ao carregar os dados: ', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { void carregarDados(); }, []);

    // Abrir Modal (Criar ou Editar)
    const handleOpenModal = (torneio?: TorneioProps)=> {
        if (torneio) {
            // Edição
            setEditId(torneio.id);
            setFormData({data_fim: torneio.data_fim, data_inicio: torneio.data_inicio, regra_id: torneio.regra_id, nome: torneio.nome});
        } else {
            // Novo
            setEditId(null);
            setFormData({data_fim: "", data_inicio: "", nome: "", regra_id: 1})
        }
        setIsModalOpen(true);
    };

    // Salvar
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                id: editId,
                nome: formData.nome,
                data_inicio: formData.data_inicio,
                data_fim: formData.data_fim,
                regra_id: Number(formData.regra_id),
                is_edit: !!editId,
            };

            const res = await fetch(`/api/torneios.php`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (data.success || data.id) {
                await carregarDados();
                setIsModalOpen(false);
            } else {
                alert('Erro: ' + data.error );
            }
        } catch (error) {
            alert('Erro de conexão.' );
        }
    };

    // Toggle Ativo/Inativo
    const handleToggle = async (id: number) => {
        if(!confirm('Deseja alterar o status deste modelo?')) return;
        try{
            await fetch('/api/torneios.php', {
                method: 'POST',
                body: JSON.stringify({ acao: 'toggle_status', id })
            });
            await carregarDados();
        } catch (error) {
            console.error(error);
        }
    };

    // Função auxiliar para achar o nome da regra
    const getNomeRegra = (id: number) => {
        const regra = modelos.find(m => m.id === id);
        return regra ? regra.nome : 'Regra Desconhecida';
    };

    // Componente auxiliar para exibir os detalhes da regra
    const RegraTooltip = ({ regra }: { regra: RegrasJSON }) => (
        <div className="text-xs space-y-2 text-gray-600">
            <div>
                <p className="font-bold text-gray-800 border-b border-gray-200 pb-1 mb-1">Pontuação Base</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <span>Pix (Qtd): <span className="font-medium text-blue-600">x{regra.pontuacao.fator_qtd_pix}</span></span>
                    <span>Pix (Valor): <span className="font-medium text-blue-600">x{regra.pontuacao.fator_valor_pix}</span></span>
                    <span>Recarga (Qtd): <span className="font-medium text-purple-600">x{regra.pontuacao.fator_qtd_recarga}</span></span>
                    <span>Recarga (Valor): <span className="font-medium text-purple-600">x{regra.pontuacao.fator_valor_recarga}</span></span>
                </div>
            </div>

            {/* Só exibe bônus se houver algum configurado (opcional) */}
            <div>
                <p className="font-bold text-gray-800 border-b border-gray-200 pb-1 mb-1">Metas Bônus</p>
                <div className="space-y-1">
                    <p>🎯 {regra.bonus.meta_pix_qtd} Pix = +{regra.bonus.pontos_bonus_pix_qtd} pts</p>
                    <p>💰 R$ {regra.bonus.meta_recarga_valor} Recarga = +{regra.bonus.pontos_bonus_recarga_valor} pts</p>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="p-8 text-center">Carregando torneios...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">🏆 Torneios</h1>
                    <p className="text-gray-500">Gerencie as competições ativas e passadas.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2"
                >
                    + Novo Torneio
                </button>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {torneios.map((torneio, index) => {
                    // Encontra a regra completa na lista de modelos
                    const regraCompleta = modelos.find(m => m.id === torneio.regra_id);
                    // Parse por garantia
                    const dadosRegra = regraCompleta
                        ? (typeof regraCompleta.regras === 'string' ? JSON.parse(regraCompleta.regras) : regraCompleta.regras)
                        : null;
                    // Verificação de último item da linha (grid-2)
                    const isLastMd = (index + 1) % 2 === 0;
                    // Verificação de último item da linha (grid-3)
                    const isLastLg = (index + 1) % 3 === 0;
                    return (
                            <div
                                key={torneio.id}
                                className={`relative group bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                                    torneio.ativo ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'
                                }`}
                            >
                                {/* TOOLTIP DE HOVER */}
                                {dadosRegra && (
                                    <div className={`{${isLastMd} ? "md:right[[102%]" : (${isLastLg} ? "lg:right-[102%]" : "left-[102%]")} absolute top-0  z-50 hidden group-hover:block w-72 bg-white border border-gray-200 p-4 rounded-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-left-2`}>
                                        {/* Seta decorativa apontando para a esquerda (opcional) */}
                                        <div className="absolute top-6 -left-2 w-4 h-4 bg-white border-l border-b border-gray-200 transform rotate-45"></div>

                                        <div className="relative z-10">
                                            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">
                                                Resumo da Regra
                                            </h4>
                                            <RegraTooltip regra={dadosRegra} />
                                        </div>
                                    </div>
                                )}
                                <div className="p-5">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={torneio.nome}>
                                            {torneio.nome}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            torneio.ativo
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                    {torneio.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                                    </div>

                                    {/* Card Body */}
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span>📅</span>
                                            <span className="font-medium">Início:</span>
                                            {new Date(torneio.data_inicio).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>🏁</span>
                                            <span className="font-medium">Fim:</span>
                                            {new Date(torneio.data_fim).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                            <span>📜</span>
                                            <span className="text-gray-500">Modelo:</span>
                                            <span className="font-medium text-blue-600">
                                        {torneio.regra_nome || getNomeRegra(torneio.regra_id)}
                                    </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer / Actions */}
                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
                                    <button
                                        onClick={() => handleToggle(torneio.id)}
                                        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {torneio.ativo ? 'Desativar' : 'Ativar'}
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(torneio)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        )
                })}

                {torneios.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-lg border border-dashed">
                        Nenhum torneio encontrado. Crie o primeiro!
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editId ? 'Editar Torneio' : 'Criar Novo Torneio'}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Torneio</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                    placeholder="Ex: Torneio de Verão"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                                    <input
                                        type="date" // ou "datetime-local" se precisar de hora
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.data_inicio}
                                        onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                                    <input
                                        type="date" // ou "datetime-local"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.data_fim}
                                        onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de Regras</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.regra_id}
                                    onChange={(e) => setFormData({...formData, regra_id: Number(e.target.value)})}
                                >
                                    <option value="">Selecione um modelo...</option>
                                    {modelos.map(modelo => (
                                        <option key={modelo.id} value={modelo.id}>
                                            {modelo.nome} {modelo.ativo ? '' : '(Inativo)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors font-medium"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

}