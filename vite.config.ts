import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) =>
{
    const Environment = loadEnv(mode, process.cwd(), '');
    const SupabaseUrl = process.env.KIOSKBOARD_SUPABASE_URL
        ?? Environment.KIOSKBOARD_SUPABASE_URL
        ?? '';
    const SupabasePublishableKey = process.env.KIOSKBOARD_SUPABASE_PUBLISHABLE_KEY
        ?? Environment.KIOSKBOARD_SUPABASE_PUBLISHABLE_KEY
        ?? '';

    return {
        build: {
            outDir: 'dist-web',
        },
        define: {
            __SUPABASE_URL__: JSON.stringify(SupabaseUrl),
            __SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(SupabasePublishableKey),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
    };
});
