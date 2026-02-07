import { TorneioProps, TournamentCardsProps } from "@/types";
import RuleTooltip from "./RuleTooltip";

// Componente auxiliar para exibir os detalhes da regra
export default function TournamentCards({
    torneios,
    modelos,
    onOpen,
    onToggle
}: TournamentCardsProps) {
        // Função auxiliar para achar o nome da regra
        const getNomeRegra = (id: number) => {
            const regra = modelos.find(m => m.id === id);
            return regra ? regra.nome : 'Regra Desconhecida';
        };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {torneios.map((torneio: TorneioProps, index: number) => {
                // Encontra a regra completa na lista de modelos
                const regraCompleta = modelos.find(m => m.id === torneio.regra_id);
                // Parse por garantia
                const dadosRegra = regraCompleta
                    ? (typeof regraCompleta.regras === 'string' ? JSON.parse(regraCompleta.regras) : regraCompleta.regras)
                    : null;
                // Verificação de último item da linha (grid-2) e (grid-3)
                const isLastMd = (index + 1) % 2 === 0;
                const isLastLg = (index + 1) % 3 === 0;

                // Montagem das classes
                const baseArrow = "absolute top-6 w-4 h-4 bg-white transform rotate-45 border border-gray-200"
                // Para telas menores que 768
                const mdPos = isLastMd ? "md:-left-[102%]" : "md:left-[102%]";
                const mdArrow = isLastMd
                    ? "md:-right-2 md:left-auto md:border-t md:border-r md:border-b-0 md:border-l-0"
                    : "md:-left-2 md:right-auto md:border-b md:border-l md:border-t-0 md:border-r-0";
                // Para telas maiores de 768
                const lgPos = isLastLg ? "lg:-left-[102%]" : "lg:left-[102%]";
                const lgArrow = isLastLg
                    ? "lg:-right-2 lg:left-auto lg:border-t lg:border-r lg:border-b-0 lg:border-l-0"
                    : "lg:-left-2 lg:right-auto lg:border-b lg:border-l lg:border-t-0 lg:border-r-0";
                // Classes combinadas
                const positionClasses = `left-[102%] ${mdPos} ${lgPos}`;
                const arrowClasses = `${baseArrow} ${mdArrow} ${lgArrow}`;
                return (
                    <div
                        key={torneio.id}
                        className={`relative group bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${torneio.ativo ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'
                            }`}
                    >
                        {/* TOOLTIP DE HOVER */}
                        {dadosRegra && (
                            <div className={`${positionClasses} absolute top-0  z-50 hidden group-hover:block w-72 bg-white border border-gray-200 p-4 rounded-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-left-2`}>
                                {/* Seta decorativa apontando para a esquerda (opcional) */}
                                <div className={arrowClasses}></div>

                                <div className="relative z-10">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">
                                        Resumo da Regra
                                    </h4>
                                    <RuleTooltip regra={dadosRegra} />
                                </div>
                            </div>
                        )}
                        <div className="p-5">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={torneio.nome}>
                                    {torneio.nome}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${torneio.ativo
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {torneio.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span>📅</span>
                                    <span className="font-medium">Início:</span>
                                    {new Date(torneio.data_inicio).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>🏁</span>
                                    <span className="font-medium">Fim:</span>
                                    {new Date(torneio.data_fim).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                    <span>📜</span>
                                    <span className="text-gray-500">Modelo:</span>
                                    <span className="font-medium text-blue-600">
                                        {torneio.regra_nome || getNomeRegra(torneio.regra_id)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                    <span className="text-gray-800">Tipo:</span>
                                    <span className={`font-medium ${torneio.tipo === 'MATRIZ' ? 'text-purple-600' : 'text-blue-600'}`}>
                                        {torneio.tipo}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card Footer / Actions */}
                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
                            <button
                                onClick={() => onToggle(torneio.id)}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {torneio.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                                onClick={() => onOpen(torneio)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                )
            })}

            {torneios.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-lg border border-dashed">
                    Nenhum torneio encontrado. Crie o primeiro!
                </div>
            )}
        </div>
    )
}