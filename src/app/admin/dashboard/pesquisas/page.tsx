'use client';

import React, { useState, useEffect } from 'react';
import {ArrowLeft, Trash2, Save, Search, Trophy, Check, ChevronsUpDown} from 'lucide-react';
import {ItemPesquisa, Operador, OperadorSimples, Torneio} from "@/types";
import { fetchTorneiosPesquisa, fetchDetalhesPesquisa, savePesquisas } from "@/services/api";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'


export default function PesquisasPage() {
    // --- ESTADOS GERAIS ---
    const [view, setView] = useState<'list' | 'form'>('list');
    const [loading, setLoading] = useState(false);

    // --- ESTADOS DA LISTAGEM DE TORNEIOS ---
    const [torneioVigente, setTorneioVigente] = useState<Torneio | null>(null);
    const [outrosTorneios, setOutrosTorneios] = useState<Torneio[]>([]);

    // --- ESTADOS DO FORMULÁRIO ---
    const [torneioSelecionado, setTorneioSelecionado] = useState<Torneio | null>(null);
    const [listaOperadores, setListaOperadores] = useState<OperadorSimples[]>([]); // Todos os disponíveis
    const [itens, setItens] = useState<ItemPesquisa[]>([]); // Os lançados na tela
    const [query, setQuery] = useState('');
    const [selectedOperador, setSelectedOperador] = useState<OperadorSimples | null>(null);

    // 1. Carregar Torneios ao abrir
    useEffect(() => {
        void carregarTorneios();
    }, []);

    const carregarTorneios = async () => {
        setLoading(true);
        try {
            const data = await fetchTorneiosPesquisa();
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
            const data = await fetchDetalhesPesquisa(torneio.id);

            setTorneioSelecionado(data.torneio);
            setListaOperadores(data.operadores);

            // Mapeia o retorno do banco para o formato do front
            const itensFormatados: ItemPesquisa[] = data.lancamentos.map((l: any) => ({
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
        // Validação simples
        if (!selectedOperador) {
            alert('Por favor, selecione um operador da lista.');
            return;
        }

        // Verifica duplicidade usando a matrícula
        if (itens.some(i => i.matricula === selectedOperador.matricula)) {
            alert('Este operador já está na lista.');
            setQuery('');
            setSelectedOperador(null);
            return;
        }

        // Adiciona na Lista
        setItens([...itens, {
            matricula: selectedOperador.matricula,
            nome: selectedOperador.nome,
            quantidade: 0
        }]);

        // Limpa o estado para a próxima inserção
        setSelectedOperador(null);
        setQuery('');
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

            const data = await savePesquisas(torneioSelecionado.id, itens);

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

    const filteredOperadores =
        query === ''
            ? listaOperadores.filter(op => !itens.some(i => i.matricula == op.matricula))
            : listaOperadores.filter((op) => {
                const notSelected = !itens.some(i => i.matricula === op.matricula);
                const matchesQuery = op.nome.toLowerCase().includes(query.toLowerCase());
                return notSelected && matchesQuery;
            })

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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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

                {/* AREA DE ADICIONAR (Headless UI Combobox) */}
                <div className="bg-slate-50 p-4 border-t border-gray-200">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Adicionar Operador</label>
                    <div className="flex gap-2">

                        {/* O Combobox substitui o input antigo */}
                        <div className="relative flex-1">
                            <Combobox
                                immediate={true}
                                value={selectedOperador}
                                onChange={setSelectedOperador}
                                onClose={() => setQuery('')} // Limpa a query ao fechar/selecionar
                            >
                                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:text-sm">
                                    <ComboboxInput
                                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
                                        displayValue={(op: OperadorSimples) => op?.nome}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="Digita para buscar..."
                                    />
                                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </ComboboxButton>
                                </div>

                                <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                    {filteredOperadores.length === 0 && query !== '' ? (
                                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                            Nenhum operador encontrado.
                                        </div>
                                    ) : (
                                        filteredOperadores.slice(0,100).map((op) => (
                                            <ComboboxOption
                                                key={op.matricula}
                                                className={({ active}) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                        active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                                    }`
                                                }
                                                value={op}
                                            >
                                                {({ selected, active }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                            {op.nome}
                                                        </span>
                                                        {/* Mostra a matrícula discretamente à direita */}
                                                        <span className={`absolute inset-y-0 right-0 flex items-center pr-4 text-xs ${active ? 'text-blue-100' : 'text-gray-400'}`}>
                                                            #{op.matricula}
                                                        </span>

                                                        {/* Ícone de check se estiver selecionado */}
                                                        {selected ? (
                                                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}>
                                                                <Check className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </ComboboxOption>
                                        ))
                                    )}
                                </ComboboxOptions>
                            </Combobox>
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