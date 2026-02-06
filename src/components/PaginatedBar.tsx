import { PaginatedBarProps } from "@/types";
import { ItemSizeSelect } from "./ItemSizeSelector";
import { PaginatedButtons } from "./PaginatedButtons";

export function PaginatedBar({
    itemsPerPage,
    onChange,
    currentPage,
    setCurrentPage,
    totalPages
}: PaginatedBarProps) {
    if (totalPages <= 1) return null;

    return (
        <>
            <ItemSizeSelect
                itemsPerPage={itemsPerPage}
                onChange={onChange}
                currentPage={currentPage}
                totalPages={totalPages}
            />
            
            <PaginatedButtons
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
            />
        </>
    )
}