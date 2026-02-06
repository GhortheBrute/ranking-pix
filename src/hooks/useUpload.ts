import { uploadRankingFile, handleSaveUpload } from "@/services/api";
import { useState, useEffect } from "react";

export default function useUpload() {
    // Estados independentes para cada upload
    const [loadingPix, setLoadingPix] = useState(false);
    const [msgPix, setMsgPix] = useState({ type: '', text: ''});

    const [loadingRecarga, setLoadingRecarga] = useState(false);
    const [msgRecarga, setMsgRecarga] = useState({ type: '', text: ''});

    // Modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ matricula: '', nome: '', apelido: '' });
    const [filaIds, setFilaIds] = useState<string[]>([]);

    const getStateByType = (type: 'PIX' | 'RECARGA') => {
        if (type === 'PIX' ) {
            return { setLoading: setLoadingPix, setMsg: setMsgPix, fileInputName: 'arquivo_pix_csv' };
        }
        return { setLoading: setLoadingRecarga, setMsg: setMsgRecarga, fileInputName: 'arquivo_recarga_csv' };
    }

    // Função genérica de upload
    const handleUpload = async (
        e: React.FormEvent,
        type: "PIX" | "RECARGA"
    ) => {
        e.preventDefault();

        const { setLoading, setMsg, fileInputName } = getStateByType(type);

        // Pega o arquivo do input
        const form = e.currentTarget as HTMLFormElement;
        const fileInput = form.elements.namedItem(fileInputName) as HTMLInputElement;

        if (!fileInput.files || fileInput.files.length === 0) {
            setMsg({ type: 'error', text: 'Selecione um arquivo CSV.'});
            return;
        }

        const file = fileInput.files[0];
        if (!file.name.endsWith('.csv')) {
            setMsg({ type: 'error', text: 'O arquivo deve ser .csv'});
            return;
        }

        setLoading(true);
        setMsg({ type: '', text: '' });

        // Monta o pacote de dados
        const formData = new FormData();
        formData.append(fileInputName, file);

        try{

            const data = await uploadRankingFile(type, fileInputName, file);

            if (data.success) {
                setMsg({ type: 'success', text: data.message || 'Upload realizado com sucesso.'});
                form.reset();
            } else if (data.error === 'operadores_inexistentes') {
                setFilaIds(data.ids || []);
                if (data.ids && data.ids.length > 0) {
                    alert(`Atenção: Existem ${data.ids.length} operadores não cadastrados neste arquivo. O sistema abrirá o cadastro para eles agora.`)
                }
            } else {
                setMsg({ type: 'error', text: data.error || 'Erro ao processar o arquivo' });
            }
        } catch (error) {
            console.error(error);
            setMsg({ type: 'error', text: 'Erro de conexão com o servidor.'});
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = (id: string) => {
        setFormData({ matricula: id, nome: '', apelido: '' });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                const payload = {
                    ...formData,
                };
    
                const data = await handleSaveUpload(payload);
    
                if (data.sucesso) {
                    setIsModalOpen(false); // Fecha modal

                    // Remove o primeiro item da fila e fará o useEffect rodar novamente.
                    setFilaIds((prev: string[]) => prev.slice(1));

                } else {
                    alert(data.erro || 'Erro ao salvar');
                }
            } catch (error) {
                alert('Erro de conexão' + error);
        }
    };

    useEffect(() => {
        if (filaIds.length > 0 && !isModalOpen) {
            handleOpenCreate(filaIds[0]);
        }
    }, [filaIds, isModalOpen]);

    return {
        pix: {
            loading: loadingPix,
            setLoading: setLoadingPix,
            msg: msgPix,
            setMsg: setMsgPix
        },
        recarga: {
            loading: loadingRecarga,
            setLoading: setLoadingRecarga,
            msg: msgRecarga,
            setMsg: setMsgRecarga
        },
        modal: {
            isOpen: isModalOpen,
            close: () => {
                if (confirm("Deseja cancelar o cadastro dos operadores restantes?")) setFilaIds([]);
                setIsModalOpen(false)
            },
            openCreate: handleOpenCreate
        },
        formData,
        setFormData,
        handleUpload,
        handleSave
    }
}