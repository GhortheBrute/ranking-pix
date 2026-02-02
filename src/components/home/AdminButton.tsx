import { LockKeyhole } from "lucide-react";
import Link from "next/link";

export default function AdminButton() {
    return (
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-20">
            <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition-all text-sm font-medium"
            >
                <LockKeyhole size={16} />
                <span className="hidden md:inline">Painel Administrativo</span>
            </Link>
        </div>
    )
}