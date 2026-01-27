'use client';

import { TorneiosList } from '@/components/TorneiosList';
import { PesquisaForm } from '@/components/PesquisaForm';
import {usePesquisaController} from "@/hooks/usePesquisaController";
import {values} from "eslint-config-next";


export default function PesquisasPage() {
    const controller = usePesquisaController();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* TELA 1: LISTA DE TORNEIOS */}
            {controller.view === 'list' && (
                <TorneiosList 
                    torneioVigente={controller.torneioVigente}
                    outrosTorneios={controller.outrosTorneios}
                    loading={controller.loading}
                    onSelect={controller.handleSelectTorneio}
                />
            )}

            {/* TELA 2: FORMULÁRIO DE PESQUISA */}
            {controller.view === 'form' && controller.selectedTorneio && (
                <PesquisaForm 
                    torneio={controller.selectedTorneio}
                    itens={controller.itens}
                    loading={controller.loading}
                    selectedOperador={controller.selectedOperador}
                    setSelectedOperador={controller.setSelectedOperador}
                    todosOperadores={controller.listaOperadores}
                    
                    // Ações
                    onBack={controller.handleBack}
                    onAddOperador={controller.handleAddOperador}
                    onUpdateQuantidade={controller.handleUpdateQuantidade}
                    onRemove={controller.handleRemoveOperador}
                    onSave={controller.handleSave}
                />
            )}
        </div>
    );
}