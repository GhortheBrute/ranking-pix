export default function PrizeInput(
    formRegras,
    updateBool,
    updateRuleValue
) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded border border-purple-100 mb-4">
                <div className="flex items-center gap-3 mb-4">
                    <input
                        type="checkbox"
                        id="checkRoleta"
                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                        checked={formRegras.premios.ativar_roleta}
                        onChange={e => updateBool('premios', 'ativar_roleta', e.target.checked)}
                    />
                    <label htmlFor="checkRoleta" className="font-bold text-slate-800">
                        Ativar Sistema de Roleta/Sorteio
                    </label>
                </div>

                <div className={`transition-opacity ${formRegras.premios.ativar_roleta ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <label className="block text-sm text-slate-600 mb-1">Pontos necessários para girar</label>
                    <input
                        type="number" step="100" min="0"
                        className="w-full p-2 border rounded bg-white"
                        value={formRegras.premios.pontos_para_roleta}
                        onChange={e => updateRuleValue('premios', 'pontos_para_roleta', e.target.value)}
                    />
                    <p className="text-xs text-purple-600 mt-2">
                        * Quando o operador atingir essa pontuação, aparecerá um botão para ele resgatar um prêmio aleatório.
                    </p>
                </div>
            </div>
        </div>
    )
}