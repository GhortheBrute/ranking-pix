import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Isso permite exportar como HTML estático para colocar no Apache depois
    output: 'export',
    basePath: process.env.NODE_ENV === 'production' ? "/ranking_pix" : undefined,
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};

export default nextConfig;