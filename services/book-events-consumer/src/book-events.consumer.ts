import 'dotenv/config';
import * as amqp from 'amqplib';
import type {ConfirmChannel, ConsumeMessage} from 'amqplib';

import {logger} from './services/logger.service';

const EXCHANGE = process.env.RABBITMQ_EXCHANGE ?? 'bms.events';
const QUEUE = process.env.RABBITMQ_QUEUE ?? 'bms.book.events';

const RETRY_EXCHANGE = 'bms.events.retry';
const RETRY_QUEUE = `${QUEUE}.retry`;
const DEAD_LETTER_EXCHANGE = 'bms.events.dlx';
const DEAD_LETTER_QUEUE = `${QUEUE}.dlq`;

const BOOK_CREATED_KEY = 'book.created';
const RETRY_KEY = 'book.created.retry';
const DEAD_LETTER_KEY = 'book.created.dead';

function getPreviousFailures(message: ConsumeMessage): number {
  const deaths = message.properties.headers?.['x-death'] as
    Array<{queue?: string; count?: number | bigint}> | undefined;

  const queueDeath = deaths?.find(entry => entry.queue === QUEUE);
  return Number(queueDeath?.count ?? 0);
}

async function handleBookEvent(
  message: ConsumeMessage,
  channel: ConfirmChannel,
): Promise<void> {
  try {
    const event = JSON.parse(message.content.toString()) as {
      eventId?: string;
      eventType?: string;
      occurredAt?: string;
      data?: {id?: number; title?: string};
    };

    if (event.eventType !== 'book.created' || !event.data) {
      throw new Error('Invalid book.created event payload');
    }

    logger.info('Processed book.created event', {
      queue: QUEUE,
      eventId: event.eventId,
      eventType: event.eventType,
      bookId: event.data.id,
      bookTitle: event.data.title,
      occurredAt: event.occurredAt,
    });

    channel.ack(message);
  } catch (processingError) {
    const reason =
      processingError instanceof Error
        ? processingError.message
        : String(processingError);

    const previousFailures = getPreviousFailures(message);

    logger.error('Book event processing failed', {
      queue: QUEUE,
      routingKey: message.fields.routingKey,
      previousFailures,
      error: reason,
    });

    if (previousFailures >= 3) {
      channel.publish(DEAD_LETTER_EXCHANGE, DEAD_LETTER_KEY, message.content, {
        persistent: true,
        contentType: 'application/json',
        headers: {
          'x-original-routing-key': message.fields.routingKey,
          'x-final-error': reason,
        },
      });

      await channel.waitForConfirms();
      channel.ack(message);

      logger.error('Book event moved to dead-letter queue', {
        queue: DEAD_LETTER_QUEUE,
        eventRoutingKey: message.fields.routingKey,
        error: reason,
      });
    } else {
      logger.warn('Book event scheduled for retry', {
        queue: QUEUE,
        retryQueue: RETRY_QUEUE,
        previousFailures,
        error: reason,
      });

      // Dead-letter to the retry queue; it returns after 5 seconds.
      channel.nack(message, false, false);
    }
  }
}

export async function startBookEventsConsumer(): Promise<void> {
  const host = process.env.RABBITMQ_HOST ?? 'localhost';
  const port = Number(process.env.RABBITMQ_PORT ?? 5672);
  const user = process.env.RABBITMQ_USER ?? 'guest';
  const password = process.env.RABBITMQ_PASSWORD ?? 'guest';

  const url =
    `amqp://${encodeURIComponent(user)}:` +
    `${encodeURIComponent(password)}@${host}:${port}`;

  const connection = await amqp.connect(url);
  const channel: ConfirmChannel = await connection.createConfirmChannel();

  connection.on('error', connectionError => {
    logger.error('RabbitMQ connection error', {
      error: connectionError.message,
    });
  });

  await channel.assertExchange(EXCHANGE, 'topic', {durable: true});
  await channel.assertExchange(RETRY_EXCHANGE, 'direct', {durable: true});
  await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'direct', {
    durable: true,
  });

  await channel.assertQueue(DEAD_LETTER_QUEUE, {durable: true});

  await channel.bindQueue(
    DEAD_LETTER_QUEUE,
    DEAD_LETTER_EXCHANGE,
    DEAD_LETTER_KEY,
  );

  await channel.assertQueue(RETRY_QUEUE, {
    durable: true,
    arguments: {
      'x-message-ttl': 5000,
      'x-dead-letter-exchange': EXCHANGE,
      'x-dead-letter-routing-key': BOOK_CREATED_KEY,
    },
  });

  await channel.bindQueue(RETRY_QUEUE, RETRY_EXCHANGE, RETRY_KEY);

  await channel.assertQueue(QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': RETRY_EXCHANGE,
      'x-dead-letter-routing-key': RETRY_KEY,
    },
  });

  await channel.bindQueue(QUEUE, EXCHANGE, BOOK_CREATED_KEY);
  await channel.prefetch(1);

  await channel.consume(
    QUEUE,
    message => {
      if (!message) return;

      handleBookEvent(message, channel).catch(handlerError => {
        logger.error('Unexpected error in book event handler', {
          queue: QUEUE,
          error:
            handlerError instanceof Error
              ? handlerError.message
              : String(handlerError),
        });
      });
    },
    {noAck: false},
  );

  logger.info('Book Events Consumer listening', {
    queue: QUEUE,
    exchange: EXCHANGE,
  });
}
