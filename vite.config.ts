import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import https from 'https';
import { defineConfig, Plugin } from 'vite';

function ttsProxyPlugin(): Plugin {
  const handler = (req: any, res: any, next: any) => {
    if (!req.url?.startsWith('/api/tts')) {
      return next();
    }
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const text = urlObj.searchParams.get('text');
      if (!text) {
        res.statusCode = 400;
        res.end('Missing text parameter');
        return;
      }
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
      https.get(
        googleTtsUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        },
        (ttsRes) => {
          res.writeHead(ttsRes.statusCode || 200, {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
          });
          ttsRes.pipe(res);
        }
      ).on('error', (err) => {
        res.statusCode = 500;
        res.end(err.message);
      });
    } catch (err: any) {
      res.statusCode = 500;
      res.end(err.message);
    }
  };

  return {
    name: 'tts-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), ttsProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
