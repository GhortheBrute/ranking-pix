// src/components/RankingTable.tsx
import { Operador } from "@/types";

interface Props {
  titulo: string;
  dados: Operador[];
  tipo: 'pix' | 'recarga'; // Define qual coluna destacar
}

export default function RankingTable({ titulo, dados, tipo }: Props) {
  // Ordena os dados antes de exibir (Frontend Sorting)
  // Nota: Idealmente o PHP já manda ordenado, mas garantimos aqui.
  const dadosOrdenados = [...dados].sort((a, b) => {
    // Ordena primeiro por Quantidade, depois por Valor
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
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-center w-16">#</th>
              <th className="px-6 py-3">Operador</th>
              <th className="px-6 py-3 text-right">Qtd.</th>
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
                    <span className="text-xs text-gray-400">Mat: {op.matricula}</span>
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
                        Nenhum dado encontrado para este período.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}