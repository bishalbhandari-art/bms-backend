import {Request, Response} from '@loopback/rest';
import {logger} from './logger.service';

export type ServiceName = 'books' | 'authors' | 'categories';

const serviceUrls: Record<ServiceName, string> = {
  books: process.env.BOOKS_SERVICE_URL ?? 'http://localhost:3001',
  authors: process.env.AUTHORS_SERVICE_URL ?? 'http://localhost:3002',
  categories: process.env.CATEGORIES_SERVICE_URL ?? 'http://localhost:3003',
};

export async function forwardRequest(
  service: ServiceName,
  request: Request,
  response: Response,
  body?: object,
): Promise<void> {
  const startedAt = Date.now();
  const path = request.originalUrl.split('?')[0];
  const targetUrl = `${serviceUrls[service]}${request.originalUrl}`;

  const headers: Record<string, string> = {};
  const accept = request.get('accept');

  if (accept) {
    headers.accept = accept;
  }

  const options: RequestInit = {
    method: request.method,
    headers,
    signal: AbortSignal.timeout(5000),
  };

  if (body !== undefined) {
    headers['content-type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  logger.info('Gateway request received', {
    downstreamService: service,
    method: request.method,
    path,
  });

  try {
    const upstream = await fetch(targetUrl, options);
    const contentType = upstream.headers.get('content-type');
    const responseBody = await upstream.text();
    const durationMs = Date.now() - startedAt;

    logger.log(
      upstream.status >= 400 ? 'warn' : 'info',
      'Gateway downstream response',
      {
        downstreamService: service,
        method: request.method,
        path,
        statusCode: upstream.status,
        durationMs,
      },
    );

    response.status(upstream.status);

    if (contentType) {
      response.setHeader('content-type', contentType);
    }

    if (!responseBody) {
      response.end();
      return;
    }

    response.send(responseBody);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';

    const statusCode = timedOut ? 504 : 502;
    const durationMs = Date.now() - startedAt;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Gateway downstream request failed', {
      downstreamService: service,
      method: request.method,
      path,
      statusCode,
      durationMs,
      error: errorMessage,
    });

    response.status(statusCode).send({
      error: {
        statusCode,
        message: timedOut
          ? 'Downstream service timed out'
          : 'Downstream service is unavailable',
        service,
      },
    });
  }
}
