import React, {useEffect, useState} from "react";
import {DiaEspecial, ModeloRegra, RegrasJSON} from "@/types";
import {fetchRegras, saveRegras, toggleRegras} from "@/services/api";

const REGRAS_DEFAULT: RegrasJSON = {
    pontuacao: {
        pix: {
            qtd: {
                pontos: 1,
                valor: 10
            },
            monetario: {
                pontos: 0,
                valor: 0.00
            }
        },
        recarga: {
            qtd: {
                pontos: 0,
                valor: 0
            },
            monetario: {
                pontos: 1,
                valor: 15.00
            }
        },
        dias_especiais: [],
        pesquisas: {
            qtd: {
                pontos: 1,
                valor: 1
            },
        }
    },
    bonus: {
        pix: {
            qtd: {
                meta: 0,
                pontos: 0
            },
            monetario: {
                meta: 0.00,
                pontos: 0
            }
        },
        recarga: {
            qtd: {
                meta: 0,
                pontos: 0
            },
            monetario: {
                meta: 0.00,
                pontos: 0
            }
        },
        pesquisa: {
            qtd: {
                meta: 0,
                pontos: 0
            }
        }
    },
    premios: {
        ativar_roleta: false,
        pontos_para_roleta: 1000
    }
};

export function useRegras() {
    const [modelos, setModelos] = useState<ModeloRegra[]>([]);
    const [loading, setLoading] = useState(true);

    const [novoDiaData, setNovoDiaData] = useState('');
    const [novoDiaFator, setNovoDiaFator] = useState(2); // Padrão dobrado.

    // Modal e Edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'financeiro' | 'gamificacao' | 'premios'>('financeiro');

    // Estado do Formulário (Nome + JSON separado)
    const [editId, setEditId] = useState<number | null>(null);
    const [formNome, setFormNome] = useState('');
    const [formRegras, setFormRegras] = useState<RegrasJSON>(REGRAS_DEFAULT);

    // 1. Carregar Lista
    const fetchModelos = async () => {
        try {
            const data = await fetchRegras();

            // Garante que o campo 'regras' seja um objeto, mesmo que venha string do PHP
            const formatado = data.map((m: ModeloRegra) => ({
                ...m,
                regras: typeof m.regras === 'string' ? JSON.parse(m.regras) : m.regras
            }));

            setModelos(formatado);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModelos();
    }, []);

    // 2. Abrir Modal (Criar ou Editar)
    const handleOpenModal = (modelo?: ModeloRegra) => {
        if (modelo) {
            // Edição
            setEditId(modelo.id);
            setFormNome(modelo.nome);
            setFormRegras(typeof modelo.regras === 'string' ? JSON.parse(modelo.regras) : modelo.regras);
        } else {
            // Novo
            setEditId(null);
            setFormNome('');
            setFormRegras(REGRAS_DEFAULT);
        }
        setActiveTab('financeiro');
        setIsModalOpen(true);
    };

    // 3. Salvar
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                id: editId, // Se for null, o PHP ignora (insert)
                nome: formNome,
                regras: formRegras,
                is_edit: !!editId // true se tiver ID
            };

            const data = await saveRegras(payload);

            if (data.success) {
                await fetchModelos();
                setIsModalOpen(false);
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro de conexão:' + error);
        }
    };

    // 4. Toggle Ativo/Inativo
    const handleToggle = async (id: number) => {
        if (!confirm('Deseja alterar o status deste modelo?')) return;
        await toggleRegras('toggle_status', id);
        await fetchModelos();
    };

    const handleAddDia = () => {
        if (!novoDiaData) return;

        const novoDia: DiaEspecial = {
            data: novoDiaData,
            fator: Number(novoDiaFator)
        };

        setFormRegras(prev => ({
            ...prev,
            pontuacao: {
                ...prev.pontuacao,
                dias_especiais: [...(prev.pontuacao.dias_especiais || []), novoDia]
            }
        }));

        setNovoDiaData('');
        setNovoDiaFator(2);
    }

    const handleRemoveDia = (index: number) => {
        setFormRegras(prev => {
            const novaLista = [...(prev.pontuacao.dias_especiais || [])];
            novaLista.splice(index, 1);
            return {
                ...prev,
                pontuacao: {
                    ...prev.pontuacao,
                    dias_especiais: novaLista
                }
            };
        });
    };

    // Função auxiliar para atualizar o JSON aninhado
    const updateRegra = (section: keyof RegrasJSON, field: string, value: number | string) => {
        setFormRegras(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: Number(value) // Força número para evitar erro de cálculo
            }
        }));
    };

    // Atualiza booleano
    const updateBool = (section: keyof RegrasJSON, field: string, value: boolean) => {
        setFormRegras(prev => ({
            ...prev,
            [section]: {...prev[section], [field]: value}
        }));
    };

    return {
        handleOpenModal,
        handleSave,
        handleToggle,
        handleAddDia,
        updateRegra,
        updateBool,
        activeTab,
        setActiveTab,
        editId,
        setEditId,
        formNome,
        setFormNome,
        formRegras,
        setFormRegras,
        fetchModelos,
        handleRemoveDia,
        isModalOpen,
        setIsModalOpen,
        loading,
        setLoading,
        modelos,
        setModelos,
        novoDiaData,
        setNovoDiaData,
        novoDiaFator,
        setNovoDiaFator
    }
}