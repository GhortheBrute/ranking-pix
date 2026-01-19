'use client';

import { useRanking } from "@/hooks/useRanking";
import RankingTable from "@/components/RankingTable";

export default function Home() {

    const { data, loading, error } = useRanking();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
            </div>
        )
    }

    if (error) {
    return <div className="p-10 text-red-600 font-bold">Erro: {error}</div>;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      
      {/* Cabeçalho */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard de Performance</h1>
        <p className="text-slate-500 mt-2">
            Período: {new Date(data?.periodo.inicio || '').toLocaleDateString('pt-BR')} até {new Date(data?.periodo.fim || '').toLocaleDateString('pt-BR')}
        </p>
      </header>

      {/* Grid de Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Coluna 1: Ranking de PIX */}
        <section>
             <RankingTable 
                titulo="🏆 Top Pix" 
                dados={data?.data || []} 
                tipo="pix" 
             />
        </section>

        {/* Coluna 2: Ranking de Recarga */}
        <section>
             <RankingTable 
                titulo="📱 Top Recarga" 
                dados={data?.data || []} 
                tipo="recarga" 
             />
        </section>

      </div>
    </main>
  );
}