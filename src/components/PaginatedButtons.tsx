import { PaginatedButtonsProps } from "@/types";

export function PaginatedButtons({totalPages, setCurrentPage, currentPage}: PaginatedButtonsProps) {

    
    return (
        <>
            {totalPages > 1 && (
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-200 rounded text-xs font-bold disabled:opacity-50 hover:bg-gray-300"
                    >
                        ANTERIOR
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-200 rounded text-xs font-bold disabled:opacity-50 hover:bg-gray-300"
                    >
                        PRÓXIMA
                    </button>
                </div>
            )}
        </>
    );
}