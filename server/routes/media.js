import { Router } from 'express';
import { HttpError } from '../utils/httpError.js';

const router = Router();
const ALLOWED_MEDIA_HOSTS = new Set(['images.unsplash.com']);

router.get('/', async (request, response, next) => {
  try {
    const source = request.query.src?.toString().trim();

    if (!source) {
      throw new HttpError(400, 'INVALID_MEDIA_SOURCE', 'Manca la sorgente del file multimediale.');
    }

    const sourceUrl = new URL(source);

    if (!ALLOWED_MEDIA_HOSTS.has(sourceUrl.hostname)) {
      throw new HttpError(400, 'MEDIA_HOST_NOT_ALLOWED', 'Questa sorgente esterna non e consentita.');
    }

    const upstreamResponse = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(6000),
      headers: {
        Accept: 'image/*',
      },
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      throw new HttpError(502, 'MEDIA_FETCH_FAILED', 'Non riusciamo a recuperare il contenuto richiesto.');
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'application/octet-stream';
    const cacheControl = upstreamResponse.headers.get('cache-control') || 'public, max-age=86400';

    response.setHeader('Content-Type', contentType);
    response.setHeader('Cache-Control', cacheControl);
    response.setHeader('Vary', 'Accept');

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    response.send(Buffer.from(arrayBuffer));
  } catch (error) {
    if (error.name === 'TimeoutError') {
      next(new HttpError(504, 'MEDIA_TIMEOUT', 'La sorgente esterna ha impiegato troppo tempo a rispondere.'));
      return;
    }

    next(error);
  }
});

export default router;
