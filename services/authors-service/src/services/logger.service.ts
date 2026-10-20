import 'dotenv/config';
import type {TransformableInfo} from 'logform';
import winston from 'winston';
import Transport from 'winston-transport';
import {Client} from '@opensearch-project/opensearch';

const openSearchClient = new Client({
  node: process.env.OPENSEARCH_NODE ?? 'http://localhost:9200',
});

class OpenSearchTransport extends Transport {
  log(info: TransformableInfo, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const timestamp =
      typeof info.timestamp === 'string'
        ? info.timestamp
        : new Date().toISOString();

    const logEntry = {
      ...info,
      '@timestamp': timestamp,
      service: process.env.SERVICE_NAME ?? 'authors-service',
      environment: process.env.NODE_ENV ?? 'development',
    };

    const indexName = `bms-logs-${timestamp.slice(0, 10)}`;

    openSearchClient
      .index({
        index: indexName,
        body: logEntry,
      })
      .then(() => {
        callback();
      })
      .catch((error: Error) => {
        console.error('[OpenSearch] Failed to send log:', error.message);
        callback();
      });
  }
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',

  defaultMeta: {
    service: process.env.SERVICE_NAME ?? 'authors-service',
  },

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({stack: true}),
    winston.format.json(),
  ),

  transports: [new winston.transports.Console(), new OpenSearchTransport()],
});
