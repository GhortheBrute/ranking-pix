import { Metrica, RegrasJSON } from "@/types";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface HistoricoData {
    data: string;
    pix: Metrica;
    recarga: Metrica;
}

// Interface combinada: Props do Recharts + Suas Props (regras)
interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
    regras: RegrasJSON;
    payload?: Array<{ payload: HistoricoData }>;
    label?: string;
    active?: boolean;
}

// Componente Customizado do Tooltip
const CustomTooltip = ({ active, payload, label, regras }: CustomTooltipProps) => {
    // 1. Verificação de Segurança: Só renderiza se estiver ativo e tiver dados
    if (active && payload && payload.length) {
        // O Recharts coloca seu objeto de dados dentro de payload[0].payload
        const data = payload[0].payload as HistoricoData;

        // Cálculos de Pontos (Exemplo básico usando as regras)
        // Ajuste conforme a lógica real do seu sistema
        const pontosPix = (data.pix.qtd * (regras?.pontuacao?.fator_qtd_pix || 0)) + 
                          (data.pix.valor * (regras?.pontuacao?.fator_valor_pix || 0));
        
        const pontosRecarga = (data.recarga.qtd * (regras?.pontuacao?.fator_qtd_recarga || 0)) + 
                              (data.recarga.valor * (regras?.pontuacao?.fator_valor_recarga || 0));

        const totalPontos = pontosPix + pontosRecarga;

        return (
            <div className="bg-white p-3 border border-gray-200 shadow-lg rounded text-xs text-gray-700 z-50">
                <p className="font-bold mb-2 border-b pb-1">{`Data: ${label}`}</p>
                
                {/* Seção PIX */}
                <div className="mb-2">
                    <p className="text-blue-600 font-bold">PIX</p>
                    <p>Quantidade: {data.pix.qtd}</p>
                    <p>Valor: R$ {data.pix.valor.toFixed(2)}</p>
                </div>

                {/* Seção Recarga */}
                <div className="mb-2">
                    <p className="text-purple-600 font-bold">Recargas</p>
                    <p>Quantidade: {data.recarga.qtd}</p>
                    <p>Valor: R$ {data.recarga.valor.toFixed(2)}</p>
                </div>

                {/* Totalização Estimada */}
                <div className="mt-2 pt-2 border-t border-gray-100 bg-gray-50 -mx-3 -mb-3 p-2 rounded-b">
                    <p className="font-bold text-gray-900 text-center">
                        Pontos do Dia: {totalPontos.toFixed(0)}
                    </p>
                </div>
            </div>
        );
    }

    return null;
};

// Componente Principal do Gráfico
interface HistoryChartProps {
    data: HistoricoData[];
    regras: RegrasJSON;
}

export default function HistoryChart({ data, regras }: HistoryChartProps) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart
                data={data}
                margin={{
                    top: 5,
                    right: 10,
                    left: -20, // Ajuste para esconder o eixo Y se quiser
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                
                {/* Eixo X formatando a data (ex: 2023-10-25 -> 25/10) */}
                <XAxis 
                    dataKey="data" 
                    tickFormatter={(value) => {
                        const [ano, mes, dia] = value.split('-');
                        return `${dia}/${mes}`;
                    }}
                    tick={{ fontSize: 10 }}
                />
                
                <YAxis tick={{ fontSize: 10 }} />
                
                {/* Aqui passamos o componente CustomTooltip e injetamos as regras nele */}
                <Tooltip content={<CustomTooltip regras={regras} />} />
                
                {/* Barra de PIX (Quantidade ou Valor - você decide o que mostrar na barra visual) */}
                {/* Aqui estou mostrando a Quantidade, mas você pode mudar dataKey para "pix.valor" */}
                <Bar dataKey="pix.qtd" name="Qtd Pix" fill="#3b82f6" stackId="a" />
                
                {/* Barra de Recarga */}
                <Bar dataKey="recarga.qtd" name="Qtd Recarga" fill="#9333ea" stackId="a" />
            </BarChart>
        </ResponsiveContainer>
    );
}