import https from 'https';

export default function handler(req, res) {
  const text = req.query?.text || new URL(req.url, 'http://localhost').searchParams.get('text');
  if (!text) {
    res.statusCode = 400;
    return res.end('Missing text parameter');
  }

  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;

  https.get(
    googleTtsUrl,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
}
