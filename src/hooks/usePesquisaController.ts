import { useState, useEffect } from 'react';
import {ItemPesquisa, LancamentosBackend, OperadorSimples, Torneio} from "@/types";
import {fetchDetalhesPesquisa, fetchTorneiosPesquisa, savePesquisas} from "@/services/api";

export function usePesquisaController() {
    // Estados
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');

    // Dados da Listagem
    const [torneioVigente, setTorneioVigente] = useState<Torneio | null>(null);
    const [outrosTorneios, setOutrosTorneios] = useState<Torneio[]>([]);

    // Dados do Formulário
    const [selectedTorneio, setSelectedTorneio] = useState<Torneio | null>(null);
    const [itens, setItens] = useState<ItemPesquisa[]>([]);
    const [listaOperadores, setListaOperadores] = useState<OperadorSimples[]>([]);
    const [selectedOperador, setSelectedOperador] = useState<OperadorSimples | null>(null);

    useEffect(() => {void carregarTorneios()}, []);

    const carregarTorneios = async () => {
        setLoading(true);
        try {
            const data = await fetchTorneiosPesquisa();
            setTorneioVigente(data.vigente);
            setOutrosTorneios(data.outros);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar Torneios');
        } finally {
            setLoading(false);
        }
    };

    // --- AÇÕES ---
    const handleSelectTorneio = async (torneio: Torneio) => {
        setLoading(true);
        try {
            const data = await fetchDetalhesPesquisa(torneio.id);
            setSelectedTorneio(data.torneio);
            setListaOperadores(data.operadores);

            const itensFormatados: ItemPesquisa[] = data.lancamentos.map((l: LancamentosBackend) => ({
                matricula: l.matricula,
                nome: l.nome,
                quantidade: Number(l.quantidade)
            }));
            setItens(itensFormatados);

            setView('form');
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar detalhes do Torneio.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddOperador = async () => {
        if (!selectedOperador) return alert('Selecione um operador');

        if (itens.some(i => i.matricula === selectedOperador.matricula)) {
            setSelectedOperador(null);
            return alert('Este operador já está na lista');
        }

        setItens([...itens, {
            matricula: selectedOperador.matricula,
            nome: selectedOperador.nome,
            quantidade: 0
        }]);
        setSelectedOperador(null);
    };

    const handleUpdateQuantidade = (index: number, novaQtd: string) => {
        const novos = [...itens];
        novos[index].quantidade = Number(novaQtd);
        setItens(novos);
    };

    const handleRemoveOperador = (index: number) => {
        setItens(itens.filter((_, i) => i !== index));
    }

    const handleSave = async () => {
        if (!selectedTorneio) return;

        setLoading(true);
        try {
            const data = await savePesquisas(selectedTorneio.id, itens);

            if (data.sucesso) {
                alert('Dados salvos com sucesso!');
                setView('list');
                await carregarTorneios();
            } else {
                alert('Erro: ' + data.erro);
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao salvar')
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setView('list');
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);

            const mainContainer = document.querySelector('main') || document.querySelector('.overflow-y-auto');

            if (mainContainer) {
                mainContainer.scrollTo(0, 0);
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [view]);

    return {
        view,
        setView,
        loading,
        torneioVigente,
        outrosTorneios,
        selectedTorneio,
        itens,
        listaOperadores,
        selectedOperador,
        setSelectedOperador,
        handleSelectTorneio,
        handleAddOperador,
        handleUpdateQuantidade,
        handleRemoveOperador,
        handleSave,
        handleBack
    }
}