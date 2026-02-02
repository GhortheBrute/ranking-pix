import { Globe, MapPin } from "lucide-react";
import RankingTable from "@/components/home/RankingTable";
import { HomeBodyProps } from "@/types";

export default function HomeBody({
    activeTab,
    hasLocal,
    hasMatriz,
    data,
    initialDate,
    endDate
}: HomeBodyProps) {
    return (
        <>
            {/* Cabeçalho */}
            <div className="mb-2 text-center">
                <h1 className="text-3xl font-extrabold text-blue-900">
                    Ranking Frente de Caixa
                </h1>
            </div>

            {/* --- CONTEÚDO --- */}

            {/* VISUALIZAÇÃO LOCAL */}
            {activeTab === 'local' && hasLocal && data?.local && (
                <>
                    <div className="flex items-center gap-2 text-blue-800 justify-center">
                        <MapPin className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Torneio - {data.local.torneio.nome}</h2>
                    </div>
                    <div className='mb-4 flex items-center text-blue-800 justify-center'>
                        <h3 className="text-xs font-bold">Período de {initialDate} a {endDate}</h3>
                    </div>

                    {/* TABELA DE RANKINGS */}
                    <RankingTable dados={data.local.data} tipo="LOCAL" regras={data.local.torneio.regras} />
                </>
            )}

            {/* VISUALIZAÇÃO MATRIZ */}
            {activeTab === 'matriz' && hasMatriz && data?.matriz && (
                <div className="animate-fade-in">
                    {/* Se só tem Matriz (sem abas), mostra um título específico */}
                    {!hasLocal && (
                        <div className="mb-4 flex items-center gap-2 text-green-800">
                            <Globe className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Prévia Ranking Nacional</h2>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4 text-sm border border-green-200">
                            ℹ️ Este ranking considera apenas transações únicas de PIX, conforme regra nacional.
                        </div>

                        <RankingTable dados={data.matriz.data} tipo="MATRIZ" />
                    </div>
                </div>
            )}
        </>
        
    )
}