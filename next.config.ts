/** @type {import('next').NextConfig} */
const nextConfig = {
    // Isso permite exportar como HTML estático para colocar no Apache depois
    output: 'export',

    // Descomente as linhas abaixo se for rodar o Next como servidor Node.
    // Se for usar 'export' (estático), essa configuração de rewrite
    // serve apenas para o ambiente de desenvolvimento (npm run dev).
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                // Aponte para onde seu PHP está rodando localmente (ex: XAMPP)
                destination: 'http://localhost:8000/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;