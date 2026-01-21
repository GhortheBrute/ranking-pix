// src/components/RankingTable.tsx
import { Operador } from "@/types";

interface Props {
  titulo: string;
  dados: Operador[];
  tipo: 'pix' | 'recarga';
  ocultarZeros?: boolean; // Nova propriedade opcional
}

export default function RankingTable({ titulo, dados, tipo, ocultarZeros = false }: Props) {
  
  // 1. Filtra antes de ordenar
  const dadosFiltrados = dados.filter(op => {
    if (ocultarZeros) {
        return op[tipo].qtd > 0;
    }
    return true; // Se não for para ocultar, mostra todo mundo
  });

  // 2. Ordena (Qtd desc, Valor desc)
  const dadosOrdenados = [...dadosFiltrados].sort((a, b) => {
    if (b[tipo].qtd !== a[tipo].qtd) {
        return b[tipo].qtd - a[tipo].qtd;
    }
    return b[tipo].valor - a[tipo].valor;
  });

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-slate-800 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">
            {titulo}
        </h3>
        <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">
          {dadosOrdenados.length} Ativos
        </span>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-center w-16">#</th>
              <th className="px-6 py-3">Operador</th>
              <th className="px-6 py-3 text-right">Quantidade</th>
              <th className="px-6 py-3 text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {dadosOrdenados.map((op, index) => (
              <tr 
                key={op.matricula} 
                className={`border-b hover:bg-gray-50 transition-colors ${index < 3 ? 'font-semibold' : ''}`}
              >
                <td className="px-6 py-4 text-center">
                  {index === 0 && <span className="text-xl">🥇</span>}
                  {index === 1 && <span className="text-xl">🥈</span>}
                  {index === 2 && <span className="text-xl">🥉</span>}
                  {index > 2 && <span className="text-gray-400">#{index + 1}</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-gray-900">{op.nome}</span>
                    <span className="text-xs text-gray-400">Matrícula: {op.matricula}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-base text-slate-700">
                  {op[tipo].qtd}
                </td>
                <td className="px-6 py-4 text-right text-slate-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op[tipo].valor)}
                </td>
              </tr>
            ))}
            
            {dadosOrdenados.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">
                        Nenhum operador com dados para exibir.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}