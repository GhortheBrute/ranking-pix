'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps,
    Legend
} from 'recharts';
import { HistoryDay, RegrasJSON } from '@/types';

interface HistoryChartProps {
    data: HistoryDay[];
    regras: RegrasJSON;
}

// Helper para formatar moeda
const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// Helper para calcular pontos (divisão pelo fator)
// Ex: 1 ponto a cada 50 (fator) -> 100 qtd / 50 = 2 pontos
const calcPoints = (qtd: number, fator: number) => {
    if (!fator || fator <= 0) return 0;
    return Math.floor(qtd / fator);
};

export default function HistoryChart({ data, regras }: HistoryChartProps) {

    // 1. Prepara os dados para o gráfico (calcula os pontos totais de cada barra)
    const chartData = data.map(dia => {
        // Pontos PIX (Soma de Qtd + Valor)
        const ptsPixQtd = calcPoints(dia.pix.qtd, regras.pontuacao.fator_qtd_pix);
        const ptsPixVal = calcPoints(dia.pix.valor, regras.pontuacao.fator_valor_pix);
        
        // Pontos Recarga (Soma de Qtd + Valor)
        const ptsRecQtd = calcPoints(dia.recarga.qtd, regras.pontuacao.fator_qtd_recarga);
        const ptsRecVal = calcPoints(dia.recarga.valor, regras.pontuacao.fator_valor_recarga);

        return {
            ...dia,
            // Formatamos a data para dia/mês (Ex: 25/10) para o eixo X
            dataFormatada: new Date(dia.data + "T00:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            totalPontosPix: ptsPixQtd + ptsPixVal,
            totalPontosRecarga: ptsRecQtd + ptsRecVal,
        };
    });

    // 2. Custom Tooltip (Onde a mágica do detalhamento acontece)
    const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            // O payload traz os dados do dia que o mouse está em cima
            const dia = payload[0].payload as (typeof chartData)[0];
            
            // Recalculamos para exibir detalhado
            const fatorPixQtd = regras.pontuacao.fator_qtd_pix;
            const fatorPixVal = regras.pontuacao.fator_valor_pix;
            const fatorRecQtd = regras.pontuacao.fator_qtd_recarga;
            const fatorRecVal = regras.pontuacao.fator_valor_recarga;

            const ptsPixQtd = calcPoints(dia.pix.qtd, fatorPixQtd);
            const ptsPixVal = calcPoints(dia.pix.valor, fatorPixVal);
            const ptsRecQtd = calcPoints(dia.recarga.qtd, fatorRecQtd);
            const ptsRecVal = calcPoints(dia.recarga.valor, fatorRecVal);

            return (
                <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-xs leading-relaxed min-w-[200px] z-50">
                    <p className="font-bold text-slate-700 mb-2 text-center border-b pb-1">{dia.dataFormatada}</p>
                    
                    {/* Seção PIX */}
                    <div className="mb-2">
                        <p className="font-bold text-blue-600">PIX ({dia.totalPontosPix} pts)</p>
                        {fatorPixQtd > 0 && (
                            <div className="flex justify-between text-slate-500 pl-2">
                                <span>Qtd: {dia.pix.qtd} (÷{fatorPixQtd})</span>
                                <span className="font-mono text-slate-700">= {ptsPixQtd} pts</span>
                            </div>
                        )}
                        {fatorPixVal > 0 && (
                            <div className="flex justify-between text-slate-500 pl-2">
                                <span>Vlr: {formatCurrency(dia.pix.valor)} (÷{fatorPixVal})</span>
                                <span className="font-mono text-slate-700">= {ptsPixVal} pts</span>
                            </div>
                        )}
                    </div>

                    {/* Seção Recarga */}
                    <div>
                        <p className="font-bold text-purple-600">Recarga ({dia.totalPontosRecarga} pts)</p>
                        {fatorRecQtd > 0 && (
                            <div className="flex justify-between text-slate-500 pl-2">
                                <span>Qtd: {dia.recarga.qtd} (÷{fatorRecQtd})</span>
                                <span className="font-mono text-slate-700">= {ptsRecQtd} pts</span>
                            </div>
                        )}
                        {fatorRecVal > 0 && (
                            <div className="flex justify-between text-slate-500 pl-2">
                                <span>Vlr: {formatCurrency(dia.recarga.valor)} (÷{fatorRecVal})</span>
                                <span className="font-mono text-slate-700">= {ptsRecVal} pts</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-800">
                        <span>Total do Dia:</span>
                        <span>{dia.totalPontosPix + dia.totalPontosRecarga} pts</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="dataFormatada" 
                        tick={{ fontSize: 10, fill: '#64748b' }} 
                        axisLine={false} 
                        tickLine={false} 
                    />
                    <YAxis 
                        tick={{ fontSize: 10, fill: '#64748b' }} 
                        axisLine={false} 
                        tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    
                    {/* Barra PIX */}
                    <Bar 
                        dataKey="totalPontosPix" 
                        name="Pontos PIX" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                        barSize={12} // Barra mais fina
                    />
                    
                    {/* Barra Recarga */}
                    <Bar 
                        dataKey="totalPontosRecarga" 
                        name="Pontos Recarga" 
                        fill="#9333ea" 
                        radius={[4, 4, 0, 0]} 
                        barSize={12} 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}