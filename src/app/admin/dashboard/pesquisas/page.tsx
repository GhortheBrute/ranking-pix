'use client';

import { useState, useEffect } from 'react';
import {ItemPesquisa, OperadorSimples, Torneio} from "@/types";
import { fetchTorneiosPesquisa, fetchDetalhesPesquisa, savePesquisas } from "@/services/api";
import { TorneiosList } from '@/components/TorneiosList';
import { PesquisaForm } from '@/components/PesquisaForm';


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

    return (
        <div className="min-h-screen bg-slate-50">
            {/* TELA 1: LISTA DE TORNEIOS */}
            {view === 'list' && (
                <TorneiosList 
                    torneioVigente={torneioVigente}
                    outrosTorneios={outrosTorneios}
                    loading={loading}
                    onSelect={handleSelectTorneio} 
                />
            )}

            {/* TELA 2: FORMULÁRIO DE PESQUISA */}
            {view === 'form' && torneioSelecionado && (
                <PesquisaForm 
                    torneio={torneioSelecionado}
                    itens={itens}
                    loading={loading}
                    selectedOperador={selectedOperador}
                    setSelectedOperador={setSelectedOperador}
                    todosOperadores={listaOperadores}
                    
                    // Ações
                    onBack={() => setView('list')}
                    onAddOperador={handleAddOperador}
                    onUpdateQuantidade={updateQuantidade}
                    onRemove={removeOperador}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}