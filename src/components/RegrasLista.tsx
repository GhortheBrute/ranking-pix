import { RegrasJSON, RegrasListaProps } from "@/types";
import { formatarFatorAmigavel } from "@/utils/math";
import { Power, Edit, AlertCircle } from "lucide-react";

export default function RegrasLista({
    loading,
    modelos,
    onEdit,
    onToggle
}: RegrasListaProps) {
    // 1. Tratamento de Loading (Skeleton Screen simples)
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-slate-100 p-6 rounded-xl h-64 animate-pulse border-l-4 border-slate-200">
                        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // 2. Tratamento de Lista Vazia
    if (modelos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                <AlertCircle size={48} className="mb-2 opacity-50" />
                <p className="font-medium">Nenhum modelo de regra encontrado.</p>
                <p className="text-sm">Crie um novo modelo para começar.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {modelos.map(m => {
                const regras = (typeof m.regras === 'string' ? JSON.parse(m.regras) : m.regras) as RegrasJSON;

                return (
                    <div key={m.id} className={`bg-white p-6 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md ${m.ativo ? 'border-green-500' : 'border-gray-300'}`}>
                        
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={m.nome}>{m.nome}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${m.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {m.ativo ? 'ATIVO' : 'INATIVO'}
                            </span>
                        </div>

                        {/* Resumo com Formatação Inteligente */}
                        <div className="text-sm text-slate-500 space-y-3 mb-6">
                            
                            {/* Seção PIX */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PIX</p>
                                <div className="pl-2 border-l-2 border-slate-100 space-y-1">
                                    <p className="flex justify-between">
                                        <span>Qtd:</span> 
                                        <b className="text-slate-700">
                                            {formatarFatorAmigavel(regras.pontuacao.fator_qtd_pix, "PIX", "PIX")}
                                        </b>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Valor:</span>
                                        <b className="text-slate-700">
                                            {regras.pontuacao.fator_valor_pix > 0 
                                                ? `1 ponto a cada ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(regras.pontuacao.fator_valor_pix)}` 
                                                : '0 pontos'}
                                        </b>
                                    </p>
                                </div>
                            </div>
                            
                            {/* Seção Recarga */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recarga</p>
                                <div className="pl-2 border-l-2 border-slate-100 space-y-1">
                                    <p className="flex justify-between">
                                        <span>Qtd:</span>
                                        <b className="text-slate-700">
                                            {formatarFatorAmigavel(regras.pontuacao.fator_qtd_recarga, "Recargas", "Recarga")}
                                        </b>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Valor:</span>
                                        <b className="text-slate-700">
                                            {regras.pontuacao.fator_valor_recarga > 0 
                                                ? `1 ponto a cada ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(regras.pontuacao.fator_valor_recarga)}` 
                                                : '0 pontos'}
                                        </b>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <button onClick={() => onToggle(m.id)}
                                className={`p-2 rounded hover:bg-slate-50 transition-colors ${m.ativo ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`} 
                                title={m.ativo ? "Desativar" : "Ativar"}>
                                <Power size={20} />
                            </button>
                            <button onClick={() => onEdit(m)}
                                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2 text-sm font-bold transition-colors">
                                <Edit size={18} /> Editar
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}