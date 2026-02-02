import { HomeTabsProps } from "@/types";
import { Globe, MapPin } from "lucide-react";

export default function HomeTabs({hasLocal, hasMatriz, setActiveTab, activeTab}: HomeTabsProps) {
    return (
        <>
            {hasLocal && hasMatriz && (
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                        <button
                            onClick={() => setActiveTab('local')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                                ${activeTab === 'local'
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            {/* Ícone de Mapa/Local (opcional) */}
                            <MapPin size={16} />
                            Ranking Filial
                        </button>
                        <button
                            onClick={() => setActiveTab('matriz')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                                ${activeTab === 'matriz'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            {/* Ícone de Globo/Mundo (opcional) */}
                            <Globe size={16} />
                            Prévia Ranking Nacional
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}