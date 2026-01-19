// src/hooks/useRanking.ts
import { useState, useEffect } from 'react';
import { RankingResponse } from '@/types';

export function useRanking(inicio?: string, fim?: string) {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Monta a URL com parametros (Se não passar data, o PHP assume mês atual)
        const params = new URLSearchParams();
        if (inicio) params.append('inicio', inicio);
        if (fim) params.append('fim', fim);

        // O Next.js vai redirecionar /api para o seu PHP local via next.config.js
        const response = await fetch(`/api/get_ranking.php?${params.toString()}`);
        
        if (!response.ok) throw new Error('Erro ao buscar ranking');
        
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [inicio, fim]);

  return { data, loading, error };
}