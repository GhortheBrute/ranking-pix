'use client';

import TournamentCards from "@/components/Tournaments/TournamentCards";
import TournamentModal from "@/components/Tournaments/TournamentModal";
import useTournaments from "@/hooks/useTournaments";
import React from "react";


export default function TorneioPage() {
    const {
        loading,
        onOpen,
        torneios,
        modelos,
        ontoggle,
        isOpen,
        onSave,
        formData,
        setFormData,
        onClose
    } = useTournaments();



    if (loading) return <div className="p-8 text-center">Carregando torneios...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">🏆 Torneios</h1>
                    <p className="text-gray-500">Gerencie as competições ativas e passadas.</p>
                </div>
                <button
                    onClick={() => onOpen()}
                    className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2"
                >
                    + Novo Torneio
                </button>
            </div>

            {/* Grid de Cards */}
            <TournamentCards
                torneios={torneios}
                modelos={modelos}
                onToggle={ontoggle}
                onOpen={onOpen}
            />
            

            {/* Modal */}
            <TournamentModal
                isOpen={isOpen}
                onSave={onSave}
                formData={formData}
                setFormData={setFormData}
                modelos={modelos}
                onClose={onClose}
            />
            
        </div>
    );
    
}