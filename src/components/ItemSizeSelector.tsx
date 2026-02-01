import { ItemSizeSelectProps } from "@/types";

export function ItemSizeSelect({
    itemsPerPage,
    onChange,
    currentPage
}: ItemSizeSelectProps) {

    return (
        <div className="mb-2 text-sm text-gray-600  uppercase flex flex-col md:flex-row justify-between items-end gap-2 no-print">
            <div className="flex items-center gap-2">
                <label htmlFor="rows" className="text-xs font-bold">Exibir:</label>
                <select
                    id="rows"
                    value={itemsPerPage}
                    onChange={onChange}
                    className="border rounded p-1 text-xs bg-white  text-black  focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                </select>
            </div>
            <span>Página <span className="font-bold text-black ">{currentPage}</span> de <span className="font-bold">{totalPages || 1}</span></span>
        </div>
    )
}