import React, {useEffect, useState} from "react";
import { ModeloRegra, RegrasJSON} from "@/types";
import {fetchRegras, saveRegras, toggleRegras } from "@/services/api";

const DEFAULT_RULES: RegrasJSON = {
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
    const [rules, setRules] = useState<ModeloRegra[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal e Edição
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado do Formulário (Nome + JSON separado)
    const [editId, setEditId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formRules, setFormRules] = useState<RegrasJSON>(DEFAULT_RULES);

    // Navegação
    const [activeTab, setActiveTab] = useState<'financeiro' | 'gamificacao' | 'premios'>('financeiro');

    // 1. Carregar Lista
    const fetchRules = async () => {
        try {
            const data = await fetchRegras();

            // Garante que o campo 'regras' seja um objeto, mesmo que venha string do PHP
            const formated = data.map((m: ModeloRegra) => ({
                ...m,
                regras: typeof m.regras === 'string' ? JSON.parse(m.regras) : m.regras
            }));

            setRules(formated);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const updateRuleValue = (
        category: keyof RegrasJSON,
        item: string,
        subItem: string,
        field: string,
        value: number
    ) => {
        setFormRules(prev=> {
            const catObj = prev[category] as any;

            return {
                ...prev,
                [category]: {
                    ...catObj,
                    [item]: {
                        ...catObj[item],
                        [subItem]: {
                            ...catObj[item][subItem],
                            [field]: value
                        }
                    }
                }
            }
        })
    };

    const openNew = () => {
        setFormName('');
        setFormRules(DEFAULT_RULES);
        setEditId(null);
        setIsModalOpen(true);
    };

    const openEdit = (rule: ModeloRegra) => {
        setFormName(rule.nome);
        setFormRules(rule.regras as RegrasJSON);
        setEditId(rule.id);
        setIsModalOpen(true);
    };

    const onToggle = async (id: number) => {
        if (!confirm('Deseja alterar o status deste modelo?')) return;
        await toggleRegras('toggle_status', id);
        await fetchRules();
    }

    const save = async () => {
        try {
            await saveRegras({ id: editId, nome: formName, regras: formRules });
            await fetchRules();
            setIsModalOpen(false);
        } catch (e) {
            alert('Erro ao salvar: ' + e);
        }
    };

    return {
        rules,
        loading,
        form: {
            name: formName,
            setName: setFormName,
            rules: formRules,
            setRules: setFormRules,
            updateRuleValue,
            editId
        },
        modal: {
            isOpen: isModalOpen,
            openNew,
            openEdit,
            close: () => setIsModalOpen(false),
            save,
            onToggle,
            activeTab,
            setActiveTab
        }
    };
}