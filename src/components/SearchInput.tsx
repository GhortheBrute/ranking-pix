import { SearchLogsProps } from "@/types";
import { Search } from "lucide-react";

export default function SearchInput({placeholder, value, onChange}: SearchLogsProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 flex items-center gap-2">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="flex-1 outline-none text-slate-700"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
    )
}