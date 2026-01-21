'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e:React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch ('/api/admin.php?acao=login', {
            method: 'POST',
            body: JSON.stringify({ login, senha })
        });
        try{
            const data = await res.json();

            if(data.sucesso) {
                localStorage.setItem('admin_token', JSON.stringify(data.usuario));
                router.push('/admin/dashboard');
            } else {
                alert(data.erro || 'Login inválido!');
                setLoading(false);
            }
        } catch (err) {
            console.log("Erro ao processar JSON: ", err);
            alert('Erro ao tentar fazer login.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="absolute top-4 left-4">
                <Link href="/" className="text-slate-800 flex items-center gap-2 font-bold hover:underline">
                    <ArrowLeft size={20} /> Voltar
                </Link>
            </div>

            <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-96 border border-slate-700">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Acesso Administrativo</h1>
                
                <div className="mb-4">
                    <label className="block text-slate-400 text-sm mb-1">Usuário</label>
                    <input
                        className="w-full p-3 bg-slate-900 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Digite seu usuário" 
                        value={login} 
                        onChange={e => setLogin(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-slate-400 text-sm mb-1">Senha</label>
                    <input
                        className="w-full p-3 bg-slate-900 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                        type="password" 
                        placeholder="Digite sua senha" 
                        value={senha} 
                        onChange={e => setSenha(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <button 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-500 disabled:opacity-50 flex justify-center items-center gap-2 transition-colors"
                >
                    {loading ? <><Loader2 className="animate-spin" /> Entrando...</> : 'Entrar'}
                </button>
            </form>
        </div>
    );

}