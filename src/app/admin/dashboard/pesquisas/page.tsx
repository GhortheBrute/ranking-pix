'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Save, Search, Trophy } from 'lucide-react';

// Tipos
interface Torneio {
    id: number;
    nome: string;
    data_inicio: string;
    data_fim: string;
}

interface Operador {
    matricula: number;
    nome: string;
}

interface ItemPesquisa {
    matricula: number;
    nome: string; // Para exibição
    quantidade: number;
}

export default function PesquisasPage() {
    // --- ESTADOS GERAIS ---
    const [view, setView] = useState<'list' | 'form'>('list');
    const [loading, setLoading] = useState(false);

    // --- ESTADOS DA LISTAGEM DE TORNEIOS ---
    const [torneioVigente, setTorneioVigente] = useState<Torneio | null>(null);
    const [outrosTorneios, setOutrosTorneios] = useState<Torneio[]>([]);

    // --- ESTADOS DO FORMULÁRIO ---
    const [torneioSelecionado, setTorneioSelecionado] = useState<Torneio | null>(null);
    const [listaOperadores, setListaOperadores] = useState<Operador[]>([]); // Todos os disponíveis
    const [itens, setItens] = useState<ItemPesquisa[]>([]); // Os lançados na tela
    const [novoOperadorInput, setNovoOperadorInput] = useState(''); // O texto do dropdown

    // 1. Carregar Torneios ao abrir
    useEffect(() => {
        void carregarTorneios();
    }, []);

    const carregarTorneios = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pesquisas.php');
            const data = await res.json();
            setTorneioVigente(data.vigente);
            setOutrosTorneios(data.outros);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Entrar no Torneio (Carregar Detalhes)
    const handleSelectTorneio = async (torneio: Torneio) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/pesquisas.php?torneio_id=${torneio.id}`);
            const data = await res.json();

            setTorneioSelecionado(data.torneio);
            setListaOperadores(data.operadores);

            // Mapeia o retorno do banco para o formato do front
            const itensFormatados = data.lancamentos.map((l: any) => ({
                matricula: l.matricula,
                nome: l.nome,
                quantidade: Number(l.quantidade)
            }));
            setItens(itensFormatados);

            setView('form');
        } catch (error) {
            alert('Erro ao carregar detalhes.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Adicionar Operador (Transforma Dropdown em Linha)
    const handleAddOperador = () => {
        // Acha o operador baseando-se no texto "NOME - #ID" ou apenas pelo nome se for único
        // Logica para extrair o ID do texto do datalist (Ex: "Joao - #15")
        const match = novoOperadorInput.match(/#(\d+)$/);

        let operadorId = 0;
        let operadorNome = '';

        if (match) {
            operadorId = parseInt(match[1]);
            const op = listaOperadores.find(o => o.matricula === operadorId);
            if (op) operadorNome = op.nome;
        } else {
            // Tenta achar só pelo nome exato (caso o usuário não digite o ID)
            const op = listaOperadores.find(o => o.nome.toLowerCase() === novoOperadorInput.toLowerCase());
            if (op) {
                operadorId = op.matricula;
                operadorNome = op.nome;
            }
        }

        if (!operadorId || !operadorNome) {
            alert('Operador inválido ou não encontrado. Selecione na lista.');
            return;
        }

        // Verifica duplicidade
        if (itens.some(i => i.matricula === operadorId)) {
            alert('Este operador já está na lista.');
            setNovoOperadorInput('');
            return;
        }

        // Adiciona na lista
        setItens([...itens, { matricula: operadorId, nome: operadorNome, quantidade: 0 }]);
        setNovoOperadorInput(''); // Limpa o dropdown
    };

    // 4. Alterar Quantidade
    const updateQuantidade = (index: number, valor: string) => {
        const novosItens = [...itens];
        novosItens[index].quantidade = Number(valor);
        setItens(novosItens);
    };

    // 5. Remover Linha
    const removeOperador = (index: number) => {
        const novosItens = [...itens];
        novosItens.splice(index, 1);
        setItens(novosItens);
    };

    // 6. Salvar Tudo
    const handleSave = async () => {
        if (!torneioSelecionado) return;
        setLoading(true);
        try {
            const payload = {
                torneio_id: torneioSelecionado.id,
                itens: itens
            };

            const res = await fetch('/api/pesquisas.php', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.sucesso) {
                alert('Dados salvos com sucesso!');
                setView('list'); // Volta para lista ou fica na tela? Vou deixar voltar para lista.
                await carregarTorneios();
            } else {
                alert('Erro: ' + data.erro);
            }
        } catch (error) {
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    function SelecAllInput() {
        const handleFocus = (event) => {
            event.target.select();
        }
    }

    // --- VIEW: LISTA DE TORNEIOS ---
    if (view === 'list') {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    📊 Lançamento de Pesquisas
                </h1>

                {loading && <p className="text-gray-500">Carregando...</p>}

                {/* Torneio Vigente em Destaque */}
                {torneioVigente && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">Torneio Vigente</h2>
                        <div
                            onClick={() => handleSelectTorneio(torneioVigente)}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white shadow-lg cursor-pointer transform transition hover:scale-[1.01] hover:shadow-xl group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Trophy className="text-yellow-300" size={24} />
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">ATUAL</span>
                                    </div>
                                    <h3 className="text-2xl font-bold">{torneioVigente.nome}</h3>
                                    <p className="text-blue-100 mt-1 text-sm">
                                        {new Date(torneioVigente.data_inicio).toLocaleDateString('pt-BR')} até {new Date(torneioVigente.data_fim).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition">
                                    <ArrowLeft className="rotate-180" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Outros Torneios */}
                {outrosTorneios.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">Outros Torneios Ativos</h2>
                        <div className="grid gap-4">
                            {outrosTorneios.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => handleSelectTorneio(t)}
                                    className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-bold text-slate-700">{t.nome}</h3>
                                        <p className="text-xs text-gray-500">
                                            {new Date(t.data_inicio).toLocaleDateString('pt-BR')} - {new Date(t.data_fim).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <ArrowLeft className="rotate-180 text-gray-300" size={20} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- VIEW: FORMULÁRIO ---
    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setView('list')}
                    className="p-2 hover:bg-gray-100 rounded-full text-slate-600 transition"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{torneioSelecionado?.nome}</h1>
                    <p className="text-sm text-gray-500">Lançamento de pesquisas realizadas</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* LISTAGEM (As linhas que viram colunas) */}
                <div className="divide-y divide-gray-100">
                    {itens.map((item, index) => (
                        <div key={item.matricula} className="p-4 flex items-center gap-4 group hover:bg-slate-50 transition">

                            {/* Coluna 1: Nome (ReadOnly) */}
                            <div className="flex-1">
                                <span className="font-bold text-slate-700 block">{item.nome}</span>
                                <span className="text-xs text-gray-400 font-mono">#{item.matricula}</span>
                            </div>

                            {/* Coluna 2: Input Quantidade */}
                            <div className="w-32">
                                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Qtd.</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-right font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    onFocus={(e) => e.target.select()}
                                    value={item.quantidade | 0}
                                    onChange={(e) => updateQuantidade(index, e.target.value)}
                                />
                            </div>

                            {/* Coluna 3: Delete Button */}
                            <button
                                onClick={() => removeOperador(index)}
                                className="text-gray-300 hover:text-red-500 p-2 transition"
                                title="Remover da lista"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {itens.length === 0 && (
                        <div className="p-8 text-center text-gray-400 italic">
                            Nenhum operador lançado ainda. Adicione abaixo.
                        </div>
                    )}
                </div>

                {/* AREA DE ADICIONAR (Dropdown estilo Google Keep) */}
                <div className="bg-slate-50 p-4 border-t border-gray-200">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Adicionar Operador</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                list="operadores-list"
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Digite para buscar nome..."
                                value={novoOperadorInput}
                                onChange={(e) => setNovoOperadorInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddOperador();
                                }}
                                // Quando perder o foco ou clicar numa opção do datalist, tenta adicionar?
                                // Melhor deixar só no Enter ou botão para evitar UX ruim de adicionar sem querer.
                            />
                            {/* DATALIST NATIVO (Funciona como um select pesquisável) */}
                            <datalist id="operadores-list">
                                {listaOperadores
                                    // Filtra quem já está na lista para não mostrar duplicado
                                    .filter(op => !itens.some(i => i.matricula === op.matricula))
                                    .map(op => (
                                        <option key={op.matricula} value={`${op.nome} - #${op.matricula}`} />
                                    ))}
                            </datalist>
                        </div>
                        <button
                            onClick={handleAddOperador}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition"
                        >
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer de Ações */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md font-bold flex items-center gap-2 transition disabled:opacity-50"
                >
                    <Save size={20} />
                    {loading ? 'Salvando...' : 'Salvar Lançamentos'}
                </button>
            </div>
        </div>
    );
}