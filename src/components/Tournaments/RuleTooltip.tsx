import { RegrasJSON } from "@/types";

export default function RuleTooltip({ regra }: { regra: RegrasJSON }) {
    return (
        <div className="text-xs space-y-2 text-gray-600">
            <div>
                <p className="font-bold text-gray-800 border-b border-gray-200 pb-1 mb-1">Pontuação Base</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <span>Pix (Qtd): <span className="font-medium text-blue-600">x{regra.pontuacao.fator_qtd_pix}</span></span>
                    <span>Pix (Valor): <span className="font-medium text-blue-600">x{regra.pontuacao.fator_valor_pix}</span></span>
                    <span>Recarga (Qtd): <span className="font-medium text-purple-600">x{regra.pontuacao.fator_qtd_recarga}</span></span>
                    <span>Recarga (Valor): <span className="font-medium text-purple-600">x{regra.pontuacao.fator_valor_recarga}</span></span>
                </div>
            </div>

            {/* Só exibe bônus se houver algum configurado (opcional) */}
            <div>
                <p className="font-bold text-gray-800 border-b border-gray-200 pb-1 mb-1">Metas Bônus</p>
                <div className="space-y-1">
                    <p>🎯 {regra.bonus.meta_pix_qtd} Pix = +{regra.bonus.pontos_bonus_pix_qtd} pts</p>
                    <p>💰 R$ {regra.bonus.meta_recarga_valor} Recarga = +{regra.bonus.pontos_bonus_recarga_valor} pts</p>
                </div>
            </div>
        </div>
    );
}