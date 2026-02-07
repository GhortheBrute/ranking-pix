import { fetchTorneiosData, fetchTorneiosRegras, handleSaveTorneios, ToggleTorneio } from "@/services/api";
import { TorneioProps, ModeloRegra, TorneioPayload } from "@/types";
import { useState, useEffect } from "react";

export default function useTournaments() {
    const [torneios, setTorneios] = useState<TorneioProps[]>([]);
    const [modelos, setModelos] = useState<ModeloRegra[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal e Edição
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado do Formulário
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ nome: '', data_inicio: '', data_fim: '', regra_id: 1, tipo: 'LOCAL' });

    // Carrega a Lista
    const carregarDados = async () => {
        setLoading(true);
        try {
            const dataTorneios = await fetchTorneiosData();
            const dataRegras = await fetchTorneiosRegras();

            const regrasFormatadas = dataRegras.map((m: ModeloRegra) => ({
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
    const handleOpenModal = (torneio?: TorneioProps) => {
        if (torneio) {
            // Edição
            setEditId(torneio.id);
            setFormData({ data_fim: torneio.data_fim, data_inicio: torneio.data_inicio, regra_id: torneio.regra_id, nome: torneio.nome, tipo: torneio.tipo });
        } else {
            // Novo
            setEditId(null);
            setFormData({ data_fim: "", data_inicio: "", nome: "", regra_id: 1, tipo: 'LOCAL' })
        }
        setIsModalOpen(true);
    };

    // Salvar
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: TorneioPayload = {
                id: editId,
                nome: formData.nome,
                data_inicio: formData.data_inicio,
                data_fim: formData.data_fim,
                regra_id: Number(formData.regra_id),
                is_edit: !!editId,
                tipo: formData.tipo
            };
            const data = await handleSaveTorneios(payload);

            if (data.success || data.id) {
                await carregarDados();
                setIsModalOpen(false);
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro de conexão.' + error);
        };
    }

    // Toggle Ativo/Inativo
    const handleToggle = async (id: number) => {
        if (!confirm('Deseja alterar o status deste modelo?')) return;
        try {
            await ToggleTorneio('toggle_status', id);
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

    return {
        // Dados
        torneios,
        setTorneios,
        modelos,
        setModelos,
        
        // Estado
        loading,
        setLoading,

        // Modal & Formulário
        isOpen: isModalOpen,
        setIsModalOpen,
        editId,
        setEditId,
        formData,
        setFormData,

        // Funções
        onOpen: handleOpenModal,
        onSave: handleSave,
        ontoggle: handleToggle,
        getNomeRegra,
        onClose: () => setIsModalOpen(false)
    }
}