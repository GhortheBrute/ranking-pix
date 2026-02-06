import { fetchUsuariosData, handleSaveUsuario } from "@/services/api";
import { Usuario } from "@/types";
import { useState, useEffect, useMemo } from "react";

export default function useUsers() {
    // Dados
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    // Modal e Formulário
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    // Role padrão como 'user'
    const [formData, setFormData] = useState({ id: 0, username: '', password: '', role: 'user' });

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const data = await fetchUsuariosData();
            setUsuarios(data);
        } catch (error) {
            console.error('Erro ao buscar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleOpenCreate = () => {
        setFormData({ id: 0, username: '', password: '', role: 'user' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: Usuario) => {
        setFormData({
            id: user.id,
            username: user.username,
            password: '', // IMPORTANTE: Começa vazio. Só envia se quiser trocar.
            role: user.role || 'user'
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                is_edit: isEditing
            };

            const data = await handleSaveUsuario(payload);

            if (data.sucesso) {
                fetchUsuarios();
                setIsModalOpen(false);
            } else {
                alert(data.erro || 'Erro ao salvar');
            }
        } catch (error) {
            alert('Erro de conexão' + error);
        }
    };

    const filteredUsers = useMemo(() => {
        const lowerFilter = filtro.toLowerCase();
        return usuarios.filter(u =>
            u.username.toLowerCase().includes(lowerFilter) ||
            u.id.toString().includes(filtro)
        );
    }, [usuarios, filtro]);
        

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, filteredUsers, itemsPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Volta para a primeira página para não quebrar o visual
            };

    return {
        // Dados da tabela
        usuarios: paginatedData,
        loading,

        // Controle de Busca
        filtro,
        setFiltro,

        // Paginação
        pagination: {
            currentPage,
            setCurrentPage,
            itemsPerPage,
            setItemsPerPage,
            totalPages,
            handleItemsPerPageChange
        },

        // Modal e Formulário
        modal: {
            isOpen: isModalOpen,
            isEditing,
            close: () => setIsModalOpen(false),
            openCreate: handleOpenCreate,
            openEdit: handleOpenEdit
        },
        formData,
        setFormData,
        handleSave
    };
}