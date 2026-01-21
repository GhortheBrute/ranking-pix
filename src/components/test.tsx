// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useRanking } from '@/hooks/useRanking';
import RankingTable from '@/components/RankingTable';
import Podium from '@/components/Podium';

export default function Dashboard() {
  const { data, loading, error } = useRanking();
  
  // Estado para o Toggle (Padrão: true = esconde zeros)
  const [ocultarZeros, setOcultarZeros] = useState(true);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
        </div>
    );
  }

  if (error || !data) {
    return <div className="p-10 text-red-600 font-bold">Erro: {error}</div>;
  }

  // Prepara dados para o Pódio (Top 3 de cada categoria)
  // Nota: Precisamos ordenar aqui também para pegar os top 3 corretos para o pódio
  const topPix = [...data.data].sort((a, b) => b.pix.qtd - a.pix.qtd).slice(0, 3);
  const topRecarga = [...data.data].sort((a, b) => b.recarga.qtd - a.recarga.qtd).slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      
      {/* Cabeçalho e Controles */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard de Performance</h1>
            <p className="text-slate-500 mt-1">
                Período: {new Date(data.periodo.inicio).toLocaleDateString('pt-BR')} até {new Date(data.periodo.fim).toLocaleDateString('pt-BR')}
            </p>
        </div>

        {/* Botão Toggle Customizado */}
        <button 
            onClick={() => setOcultarZeros(!ocultarZeros)}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-sm
                ${ocultarZeros 
                    ? 'bg-slate-800 text-white ring-2 ring-slate-800 ring-offset-2' 
                    : 'bg-white text-slate-600 border border-gray-300 hover:bg-gray-50'}
            `}
        >
            {ocultarZeros ? (
                <>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/> 
                    Ocultando Zeros
                </>
            ) : (
                <>
                    <span className="w-2 h-2 rounded-full bg-gray-400"/> 
                    Mostrar Todos
                </>
            )}
        </button>
      </header>

      {/* Área dos Pódios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
         <Podium titulo="Destaques Pix" top3={topPix} tipo="pix" />
         <Podium titulo="Destaques Recarga" top3={topRecarga} tipo="recarga" />
      </div>

      {/* Área das Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <section className="h-full">
             <RankingTable 
                titulo="🏆 Ranking Pix" 
                dados={data.data} 
                tipo="pix" 
                ocultarZeros={ocultarZeros}
             />
        </section>

        <section className="h-full">
             <RankingTable 
                titulo="📱 Ranking Recarga" 
                dados={data.data} 
                tipo="recarga" 
                ocultarZeros={ocultarZeros}
             />
        </section>
      </div>
    </main>
  );
}