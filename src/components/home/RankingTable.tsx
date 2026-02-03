import {HistoryOperatorResponse, RankingTableProps} from "@/types";
import {Medal, Trophy, TrendingUp, DollarSign, EyeOff, Eye, Filter, Loader2} from "lucide-react";
import React, { useMemo, useState } from "react";
import Podium from "./Podium";
import {fetchOperadorHistory} from "@/services/api";
import HistoryChart from "@/components/home/HistoryChart";



export default function RankingTable({
                                        dados,
                                        tipo,
                                        regras,
                                        torneioId,
                                        dataInicio,
                                        dataFim
}: RankingTableProps) {
    const [mostrarZerados, setMostrarZerados] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [chartData, setChartData] = useState<HistoryOperatorResponse | null>(null);
    const [loadingChart, setLoadingChart] = useState(false);

    const handleRowClick = async (matricula: number) => {
        // 1. Se clicou na linha já aberta, fecha ela.
        if (expandedRow === matricula) {
            setExpandedRow(null);
            return;
        }

        // 2. Se clicou numa nova, define como ativa e inicia o carregamento
        setExpandedRow(matricula);
        setChartData(null); // Limpa o gráfico anterior para não mostrar dados errados
        setLoadingChart(true);

        // 3. Validação de Segurança
        if (!torneioId || !dataInicio || !dataFim) {
            console.warn("Dados do torneio incompletos para buscar histórico.");
            setLoadingChart(false);
            return;
        }

        try {
            // 4. Chamada à API (Fetch-on-Demand)
            const response = await fetchOperadorHistory(matricula, dataInicio, dataFim, torneioId);
            setChartData(response);
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
            // Aqui você poderia setar um estado de erro visual se quisesse
        } finally {
            setLoadingChart(false);
        }
    };

    // --- 1. LÓGICA DE CÁLCULO E ORDENAÇÃO ---
    const dadosProcessados = useMemo(() => {
        // Mapeia adicionando o campo de pontos calculados
        const listaComPontos = dados.map((item) => {
            let pontos = 0;
            const margem = 0.0001;

            if (tipo === 'MATRIZ') {
                // Regra Matriz: Vale a quantidade de transações únicas
                pontos = item.pix.qtd;
            } else {
                // Regra Local: Usa o objeto de regras (ou padrão 1 se não houver)
                // Se você ainda não está passando 'regras' na Home, ele vai considerar 0 nos multiplicadores
                // Para teste rápido, você pode trocar (regras?.pontuacao... || 0) por (regras?.pontuacao... || 1)

                const p = regras?.pontuacao;

                if (p) {
                    pontos += Math.floor((item.pix.qtd * p.fator_qtd_pix) + margem);
                    pontos += Math.floor((item.pix.valor * p.fator_valor_pix) + margem);
                    pontos += Math.floor((item.recarga.qtd * p.fator_qtd_recarga) + margem);
                    pontos += Math.floor((item.recarga.valor * p.fator_valor_recarga) + margem);
                    pontos += Math.floor((item.pesquisas * (p.fator_qtd_pesquisas || 0)) + margem); // Garante compatibilidade se o campo for novo
                } else {
                    // Fallback se não tiver regras carregadas: soma quantidades simples para não ficar zerado
                    pontos = item.pix.qtd + item.recarga.qtd + item.pesquisas;
                }
            }

            return { ...item, pontuacao_geral: pontos };
        });

        // Ordena do Maior para o Menor
        return listaComPontos.sort((a, b) => b.pontuacao_geral - a.pontuacao_geral);

    }, [dados, tipo, regras]);

    const top3 = dadosProcessados.slice(0, 3);

    // Esconder/Mostrar zerados
    const dadosVisiveis = useMemo(() => {
        if (mostrarZerados) return dadosProcessados;
        return dadosProcessados.filter(item => (item.pontuacao_geral) >= 1);
    }, [dadosProcessados, mostrarZerados]);

    // --- 2. FORMATADORES ---
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // --- 3. RENDERIZAÇÃO ---
    return (
        <>
            <Podium top3={top3} tipo={tipo} />
            <div className="animate-fade-in">
                <div className="bg-gray-50/95 rounded-2xl shadow-lg p-6 border border-gray-100">
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

                        {/* Tabela de dados */}
                        <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-300/50 border-b border-gray-200">
                                        <tr className=" text-gray-500 text-xs uppercase tracking-wider">
                                            {tipo === 'LOCAL' && <th className="p-4 font-semibold w-16 text-center">#</th>}
                                            <th className="p-4 font-semibold">Operador</th>

                                            <th className="p-4 font-semibold text-right text-blue-600">
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
                                                    <th className="p-4 font-semibold text-right text-orange-600">
                                                        Recargas
                                                    </th>
                                                    <th className="p-4 font-semibold text-right text-gray-400 hidden md:table-cell">
                                                        Rec ($)
                                                    </th>
                                                    <th className="p-4 font-semibold text-right text-purple-600">
                                                        Pesquisas
                                                    </th>
                                                    <th className="p-4 font-semibold text-right text-gray-800">
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
                                            let rowClass = "hover:bg-gray-300 transition-colors cursor-pointer";

                                            if (rank === 1) {
                                                rankIcon = <Medal className="w-6 h-6 text-yellow-500 mx-auto drop-shadow-sm" />;
                                                rowClass = "bg-yellow-50/40 hover:bg-yellow-50 transition-colors border-l-4 border-yellow-400 cursor-pointer";
                                            } else if (rank === 2) {
                                                rankIcon = <Medal className="w-5 h-5 text-gray-400 mx-auto" />;
                                                rowClass = "bg-gray-50/40 hover:bg-gray-100 transition-colors border-l-4 border-gray-300 cursor-pointer";
                                            } else if (rank === 3) {
                                                rankIcon = <Medal className="w-5 h-5 text-amber-700 mx-auto" />;
                                                rowClass = "bg-orange-50/20 hover:bg-orange-50 transition-colors border-l-4 border-amber-600 cursor-pointer";
                                            }

                                            return (
                                                <React.Fragment key={item.matricula}>
                                                    <tr onClick={() => handleRowClick(item.matricula)} className={rowClass}>
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
                                                                    {(item.pontuacao_geral).toFixed(0)}
                                                                    <span className="text-[10px] font-normal text-gray-400 block -mt-1 uppercase">pts</span>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                    {expandedRow === item.matricula && (
                                                        <tr className="bg-blue-50/30 border-b border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                                                            <td colSpan={8} className="p-4 pt-0">
                                                                <div className="bg-white rounded-lg shadow-inner border border-gray-200 p-4 min-h-[200px] relative">

                                                                    {/* Loading State */}
                                                                    {loadingChart && (
                                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                                                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                                                            <span className="text-sm text-gray-500">Carregando histórico...</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Conteúdo do Gráfico */}
                                                                    {!loadingChart && chartData && chartData.historico.length > 0 ? (
                                                                        <div className="w-full">
                                                                            <div className="flex justify-between items-center mb-2 px-2">
                                                                                <h4 className="text-sm font-bold text-gray-700">
                                                                                    Desempenho Diário - {chartData.operador.nome}
                                                                                </h4>
                                                                                {/* Legenda simples */}
                                                                                <div className="flex gap-4 text-xs">
                                                                                    <span className="flex items-center gap-1 text-blue-600 font-bold">
                                                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> PIX
                                                                                    </span>
                                                                                                                    <span className="flex items-center gap-1 text-purple-600 font-bold">
                                                                                        <span className="w-2 h-2 rounded-full bg-purple-600"></span> Recargas
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            {/* O COMPONENTE DE GRÁFICO QUE CRIAMOS */}
                                                                            <HistoryChart
                                                                                data={chartData.historico}
                                                                                regras={chartData.torneio.regras}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        !loadingChart && (
                                                                            <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                                                                                <p>Nenhum histórico disponível para este período.</p>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
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
                </div>
            </div>
        </>
        

    );
}