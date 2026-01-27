'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Activity, ClipboardList, LayoutDashboard, LogOut, Menu, ScrollText, Trophy, Upload, UserCog, Users } from 'lucide-react';

interface Usuario {
    id: number;
    username: string;
    role: 'admin' | 'user';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const ADMIN_URL = '/admin/dashboard';

    // Verificação de segurança ao carregar
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin');
        } else {
            try{
                setUser(JSON.parse(token));
            } catch (err) {
                localStorage.removeItem('admin_token');
                router.push('/admin');
                console.log("Erro: ", err);
                
            }
        }
        setLoading(false);
    }, [router]);

    // Função de logout
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin');
    };

    // Definição dos itens do menu
    const menuItems = [
        {
            label: 'Dashboard',
            href: `${ADMIN_URL}`,
            icon: LayoutDashboard,
            roles: ['admin', 'user']
        },
        {
            label: 'Operadores',
            href: `${ADMIN_URL}/operadores`,
            icon: Users,
            roles: ['admin', 'user']
        },
        {
            label: 'Torneios',
            href: `${ADMIN_URL}/torneios`,
            icon: Trophy,
            roles: ['admin', 'user']
        },
        {
            label: 'Pesquisas',
            href: `${ADMIN_URL}/pesquisas`,
            icon: ClipboardList,
            roles: ['admin', 'user']
        },
        // Itens exclusivos de Admin
        {
            label: 'Upload de Dados',
            href: `${ADMIN_URL}/upload`,
            icon: Upload,
            roles: ['admin']
        },
        {
            label: 'Usuários do Sistema',
            href: `${ADMIN_URL}/usuarios`,
            icon: UserCog,
            roles: ['admin']
        },
        {
            label: 'Regras',
            href: `${ADMIN_URL}/regras`,
            icon: ScrollText,
            roles: ['admin', 'user']
        },
        {
            label: 'Logs do Sistema',
            href: `${ADMIN_URL}/logs`,
            icon: Activity,
            roles: ['admin']
        },
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"> Carregando...</div>
    if (!user) return null;

    return (
        <div className="min-h-screen flex bg-slate-100">
            {/* SIDEBAR */}
            <aside 
                className={`
                    bg-slate-900 text-white flex flex-col transition-all duration-300 fixed md:relative z-20 min-h-screen
                    ${sidebarOpen ? 'w-64' : 'w-20'}
                `}
            >
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    {sidebarOpen && <span className="font-bold text-xl text-blue-400">Painel Administrativo</span>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
                        <Menu size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {menuItems.map((item) => {
                            // Só renderiza se o role do usuário estiver na lista permitida do item
                            if (!item.roles.includes(user.role)) return null;

                            const isActive = pathname === item.href;

                            return (
                                <li key={item.href}>
                                    <Link 
                                        href={item.href}
                                        className={`
                                            flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                                            ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                                            ${!sidebarOpen && 'justify-center'}
                                        `}
                                        title={!sidebarOpen ? item.label : ''}
                                    >
                                        <item.icon size={20} />
                                        {sidebarOpen && <span>{item.label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{user.username}</p>
                                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                            </div>
                        )}
                        <button 
                            onClick={handleLogout} 
                            className="text-red-400 hover:text-red-300 hover:bg-slate-800 p-2 rounded"
                            title="Sair"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-1 p-8 overflow-y-auto h-screen w-full">
                {children}
            </main>
        </div>
    );
}