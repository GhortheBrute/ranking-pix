import { TableLogsProps } from "@/types";

export default function TableLogs({loading, data, getBadgeColor}: TableLogsProps) {
    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <table className="w-full bg-white rounded shadow text-sm">
                <thead className="bg-slate-700 border-b border-gray-200 text-white uppercase text-xs">
                <tr>
                    <th className="p-2">Data/Hora</th>
                    <th className="p-2">Username</th>
                    <th className="p-2">Ação</th>
                    <th className="p-2">Detalhes</th>
                    <th className="p-2">IP</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
                ) : data.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors border-b font-mono text-xs text-center">
                        <td className="p-2 font-mono text-slate-900">{log.data}</td>
                        <td className="p-2 font-bold">{log.usuario_nome}</td>
                        <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getBadgeColor(log.acao)}`}>
                                {log.acao ? log.acao.toUpperCase() : 'USER'}
                            </span>
                        </td>
                        <td className="p-2 text-slate-600">{log.detalhes}</td>
                        <td className="p-2 text-slate-400">{log.ip}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
    
}