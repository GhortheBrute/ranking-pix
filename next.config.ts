import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Isso permite exportar como HTML estático para colocar no Apache depois
    output: 'export',
    basePath: "/ranking_pix",
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};

export default nextConfig;