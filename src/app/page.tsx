'use client';

import {AlertCircle, LockKeyhole} from 'lucide-react';
import Link from "next/link";
import { useHomeRanking } from '@/hooks/useHomeRanking';
import AdminButton from '@/components/home/AdminButton';
import HomeTabs from '@/components/home/HomeTabs';
import HomeBody from '@/components/home/HomeBody';

export default function Home() {
    const {
        loading,
        data,
        activeTab,
        setActiveTab,
        hasLocal,
        hasMatriz,
        initialDate,
        endDate
    } = useHomeRanking();


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 text-blue-600">
                <div className="text-xl font-bold animate-pulse">Carregando Rankings...</div>
            </div>
        );
    }


    // 1. Caso: Nenhum Torneio Ativo
    if (!hasLocal && !hasMatriz) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-500 relative">
                {/* Botão Admin mesmo na tela vazia */}
                <div className="absolute top-4 right-4">
                    <Link href="/admin" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">
                        <LockKeyhole size={16} /> Área Restrita
                    </Link>
                </div>
                <AlertCircle size={64} className="mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold">Sem Torneios Ativos</h2>
                <p>Não há torneios vigentes no momento.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-orange-300 p-4 md:p-8 relative">

            {/* --- BOTÃO DE ADMIN (Topo Direito) --- */}
            <AdminButton />
            
            <div className="max-w-6xl mx-auto">

                {/* --- ÁREA DAS ABAS (Só aparece se TIVER OS DOIS) --- */}
                <HomeTabs
                    hasLocal={hasLocal}
                    hasMatriz={hasMatriz}
                    setActiveTab={setActiveTab} 
                    activeTab={activeTab}
                />
                
                {/* BODY */}
                <HomeBody
                    activeTab={activeTab}
                    hasLocal={hasLocal}
                    hasMatriz={hasMatriz}
                    data={data}
                    initialDate={initialDate}
                    endDate={endDate}                    
                />
                
            </div>
        </main>
    );
}