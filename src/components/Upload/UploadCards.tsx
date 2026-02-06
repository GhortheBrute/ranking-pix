import { UploadCardsProps } from "@/types";
import { AlertCircle, CheckCircle, FileType, Loader2, UploadCloud } from "lucide-react";

export default function UploadCards({
    title,
    description,
    type,
    inputName,
    state,
    onUpload,
    themeColor
 }: UploadCardsProps) {
    
    const iconBgClass = themeColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
    const successClass = 'bg-green-50 text-green-700';
    const errorClass = 'br-red-50 text-red-700';


    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3${iconBgClass} rounded-lg`}>
                    <FileType size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>

            <form onSubmit={(e) => onUpload(e, type)}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o arquivo</label>
                    <input 
                        type="file" 
                        name={inputName} 
                        accept=".csv"
                        className={`block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:${iconBgClass} hover:file:bg-opacity-80`}
                    />
                </div>

                {state.msg.text && (
                    <div className={`p-3 rounded mb-4 text-sm flex items-center gap-2 ${state.msg.type === 'success' ? successClass : errorClass}`}>
                        {state.msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {state.msg.text}
                    </div>
                )}

                <button 
                    disabled={state.loading}
                    className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {state.loading ? <><Loader2 className="animate-spin" size={18}/> Enviando...</> : <><UploadCloud size={18}/> Enviar CSV {type}</>}
                </button>
            </form>
        </div>
    )
}