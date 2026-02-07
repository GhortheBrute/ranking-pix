import { fetchOperadoresData, saveOperador, ToggleOperador } from "@/services/api";
import { Operador } from "@/types";
import { useState, useEffect, useMemo } from "react";

export default function useOperators() {
    const [operadores, setOperadores] = useState<Operador[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ matricula: '', nome: '', apelido: '' });

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);



    // 1. Carregar Dados
    const fetchOperadores = async () => {
        try {
            const data = await fetchOperadoresData();
            setOperadores(data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar operadores:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperadores();
    }, []);

    // 2. Manipular Modal (Abrir para Criar vs Abrir para Editar)
    const handleOpenCreate = () => {
        setFormData({ matricula: '', nome: '', apelido: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (op: Operador) => {
        setFormData({
            matricula: op.matricula.toString(),
            nome: op.nome,
            apelido: op.apelido || ''
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // 3. Salvar (Form Submit)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                is_edit: isEditing
            };

            const data = await saveOperador(payload);

            if (data.sucesso) {
                fetchOperadores(); // Recarrega a tabela
                setIsModalOpen(false); // Fecha modal
            } else {
                alert(data.error || 'Erro ao salvar');
            }
        } catch (error) {
            alert('Erro de conexão: ' + error);
        }
    };

    // 4. Toggle Status (Ativar/Desativar)
    const handleToggleStatus = async (matricula: string) => {
        if (!confirm('Deseja alterar o status deste operador?')) return;
        await ToggleOperador('toggle_status', Number(matricula));
        await fetchOperadores();
    };

    // Filtro de busca no front
    const filteredOps = operadores.filter(op =>
        op.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        op.matricula.toString().includes(filtro)
    );

    // Configura a paginação dos dados
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOps.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, filteredOps, itemsPerPage]);

    const totalPages = Math.ceil(filteredOps.length / itemsPerPage);

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Volta para a primeira página para não quebrar o visual
    };
    
    return {
        // Dados
        operadores,
        setOperadores,

        // Estados
        loading,
        setLoading,
        
        //Busca
        filtro,
        setFiltro,

        // Modal e Formulário
        isOpen: isModalOpen,
        setIsModalOpen,
        isEditing,
        setIsEditing,
        formData,
        setFormData,

        // Paginação
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,

        // Funções
        onCreate: handleOpenCreate,
        onEdit: handleOpenEdit,
        onToggle: handleToggleStatus,
        onSave: handleSave,
        filteredOps,
        paginatedData,
        totalPages,
        onChange: handleItemsPerPageChange,
        onClose: () => setIsModalOpen(false)
    }
}