import { ItemRanking, RegrasJSON } from "@/types";
import {Medal, Trophy, TrendingUp, DollarSign, EyeOff, Eye, Filter} from "lucide-react";
import { useMemo, useState } from "react";

interface RankingTableProps {
    dados: ItemRanking[];
    tipo: 'LOCAL' | 'MATRIZ';
    regras?: RegrasJSON; // Opcional: Se não vier, usamos pesos padrão ou 0
}

export default function RankingTable({ dados, tipo, regras }: RankingTableProps) {
    const [mostrarZerados, setMostrarZerados] = useState(false);

    // --- 1. LÓGICA DE CÁLCULO E ORDENAÇÃO ---
    const dadosProcessados = useMemo(() => {
        // Mapeia adicionando o campo de pontos calculados
        const listaComPontos = dados.map((item) => {
            let pontos = 0;

            if (tipo === 'MATRIZ') {
                // Regra Matriz: Vale a quantidade de transações únicas
                pontos = item.pix.qtd;
            } else {
                // Regra Local: Usa o objeto de regras (ou padrão 1 se não houver)
                // Se você ainda não está passando 'regras' na Home, ele vai considerar 0 nos multiplicadores
                // Para teste rápido, você pode trocar (regras?.pontuacao... || 0) por (regras?.pontuacao... || 1)

                const p = regras?.pontuacao;

                if (p) {
                    pontos += (item.pix.qtd * p.fator_qtd_pix);
                    pontos += (item.pix.valor * p.fator_valor_pix);
                    pontos += (item.recarga.qtd * p.fator_qtd_recarga);
                    pontos += (item.recarga.valor * p.fator_valor_recarga);
                    pontos += (item.pesquisas * (p.fator_qtd_pesquisas || 0)); // Garante compatibilidade se o campo for novo
                } else {
                    // Fallback se não tiver regras carregadas: soma quantidades simples para não ficar zerado
                    pontos = item.pix.qtd + item.recarga.qtd + item.pesquisas;
                }
            }

            return { ...item, pontosCalculados: pontos };
        });

        // Ordena do Maior para o Menor
        return listaComPontos.sort((a, b) => b.pontosCalculados - a.pontosCalculados);

    }, [dados, tipo, regras]);

    // Esconder/Mostrar zerados
    const dadosVisiveis = useMemo(() => {
        if (mostrarZerados) return dadosProcessados;
        return dadosProcessados.filter(item => item.pontosCalculados > 0);
    }, [dadosProcessados, mostrarZerados]);

    // --- 2. FORMATADORES ---
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // --- 3. RENDERIZAÇÃO ---
    return (
        <div className="flex flex-col gap-3">

            {/* Barra de Ferramentas / Filtro */}
            <div className="flex justify-end">
                <button
                    onClick={() => setMostrarZerados(!mostrarZerados)}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                        ${mostrarZerados
                        ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50 shadow-sm'}
                    `}
                >
                    {mostrarZerados ? (
                        <>
                            <EyeOff size={16} /> Ocultar Zerados
                        </>
                    ) : (
                        <>
                            <Eye size={16} /> Exibir Zerados
                        </>
                    )}
                </button>
            </div>

            <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                            {tipo === 'LOCAL' && <th className="p-4 font-semibold w-16 text-center">#</th>}
                            <th className="p-4 font-semibold">Operador</th>

                            <th className="p-4 font-semibold text-right text-blue-600 bg-blue-50/30">
                                <div className="flex items-center justify-end gap-1">
                                    <TrendingUp size={14} /> PIX (Qtd)
                                </div>
                            </th>
                            {tipo === 'LOCAL' && (
                                <>
                                    <th className="p-4 font-semibold text-right text-gray-400">
                                        <div className="flex items-center justify-end gap-1">
                                            <DollarSign size={14} /> PIX ($)
                                        </div>
                                    </th>
                                    <th className="p-4 font-semibold text-right text-orange-600 bg-orange-50/30">
                                        Recargas
                                    </th>
                                    <th className="p-4 font-semibold text-right text-gray-400 hidden md:table-cell">
                                        Rec ($)
                                    </th>
                                    <th className="p-4 font-semibold text-right text-purple-600 bg-purple-50/30">
                                        Pesquisas
                                    </th>
                                    <th className="p-4 font-semibold text-right text-gray-800 bg-gray-100">
                                        <div className="flex items-center justify-end gap-1">
                                            <Trophy size={14} /> PONTOS
                                        </div>
                                    </th>
                                </>
                            )}


                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {dadosVisiveis.map((item, index) => {
                            const rank = index + 1;

                            let rankIcon = <span className="text-gray-400 font-mono font-bold">#{rank}</span>;
                            let rowClass = "hover:bg-gray-300 transition-colors";

                            if (rank === 1) {
                                rankIcon = <Medal className="w-6 h-6 text-yellow-500 mx-auto drop-shadow-sm" />;
                                rowClass = "bg-yellow-50/40 hover:bg-yellow-50 transition-colors border-l-4 border-yellow-400";
                            } else if (rank === 2) {
                                rankIcon = <Medal className="w-5 h-5 text-gray-400 mx-auto" />;
                                rowClass = "bg-gray-50/40 hover:bg-gray-100 transition-colors border-l-4 border-gray-300";
                            } else if (rank === 3) {
                                rankIcon = <Medal className="w-5 h-5 text-amber-700 mx-auto" />;
                                rowClass = "bg-orange-50/20 hover:bg-orange-50 transition-colors border-l-4 border-amber-600";
                            }

                            return (
                                <tr key={item.matricula} className={rowClass}>
                                    {tipo === 'LOCAL' && <td className="p-4 text-center">{rankIcon}</td>}

                                    <td className="p-4">
                                        <div className="font-bold text-gray-700">{item.nome}</div>
                                        <div className="text-xs text-gray-400">Matrícula: {item.matricula}</div>
                                    </td>

                                    <td className="p-4 text-right font-bold text-blue-600 bg-blue-50/10">
                                        {item.pix.qtd}
                                    </td>
                                    {tipo === 'LOCAL' && (
                                        <>
                                            <td className="p-4 text-right text-gray-500 text-sm">
                                                {formatCurrency(item.pix.valor)}
                                            </td>
                                            <td className="p-4 text-right font-medium text-orange-600 bg-orange-50/10">
                                                {item.recarga.qtd}
                                            </td>
                                            <td className="p-4 text-right text-gray-400 text-xs hidden md:table-cell">
                                                {formatCurrency(item.recarga.valor)}
                                            </td>
                                            <td className="p-4 text-right font-medium text-purple-600 bg-purple-50/10">
                                                {item.pesquisas}
                                            </td>
                                            <td className="p-4 text-right font-black text-gray-800 text-lg bg-gray-50">
                                                {item.pontosCalculados}
                                                <span className="text-[10px] font-normal text-gray-400 block -mt-1 uppercase">pts</span>
                                            </td>
                                        </>
                                    )}


                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {/* Rodapé Informativo */}
                {dadosVisiveis.length === 0 && (
                    <div className="p-12 text-center">
                        <Filter className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Nenhum operador encontrado.</p>
                        {!mostrarZerados && dadosProcessados.length > 0 && (
                            <p className="text-sm text-gray-400 mt-1">
                                (Existem {dadosProcessados.length} operadores com pontuação zerada ocultos)
                            </p>
                        )}
                    </div>
                )}

                <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium">
                    <span>
                        {mostrarZerados ? "Exibindo todos" : "Exibindo apenas pontuadores"}
                    </span>
                    <span>
                        Total: {dadosVisiveis.length} {dadosVisiveis.length !== dadosProcessados.length && `(de ${dadosProcessados.length})`}
                    </span>
                </div>
            </div>
        </div>
    );
}