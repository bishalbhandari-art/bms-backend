import * as amqp from 'amqplib';
import type {ConfirmChannel} from 'amqplib';
import {Book} from '../models';

const EXCHANGE = process.env.RABBITMQ_EXCHANGE ?? 'bms.events';

export class MessageQueueService {
  private connection?: Awaited<ReturnType<typeof amqp.connect>>;
  private channel?: ConfirmChannel;

  private async getChannel(): Promise<ConfirmChannel> {
    if (this.channel) {
      return this.channel;
    }

    const host = process.env.RABBITMQ_HOST ?? 'localhost';
    const port = Number(process.env.RABBITMQ_PORT ?? 5672);
    const user = process.env.RABBITMQ_USER ?? 'guest';
    const password = process.env.RABBITMQ_PASSWORD ?? 'guest';

    const url =
      `amqp://${encodeURIComponent(user)}:` +
      `${encodeURIComponent(password)}@${host}:${port}`;

    this.connection = await amqp.connect(url);

    this.connection.on('close', () => {
      this.connection = undefined;
      this.channel = undefined;
    });

    this.connection.on('error', error => {
      console.error('[RabbitMQ] Connection error:', error.message);
    });

    this.channel = await this.connection.createConfirmChannel();

    await this.channel.assertExchange(EXCHANGE, 'topic', {
      durable: true,
    });

    return this.channel;
  }

  async publishBookCreated(book: Book): Promise<void> {
    const channel = await this.getChannel();

    const event = {
      eventId: `${book.id}-${Date.now()}`,
      eventType: 'book.created',
      occurredAt: new Date().toISOString(),
      data: book,
    };

    channel.publish(
      EXCHANGE,
      'book.created',
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: 'application/json',
        messageId: event.eventId,
        timestamp: Date.now(),
      },
    );

    await channel.waitForConfirms();

    console.log(`[RabbitMQ] Published book.created for book ID ${book.id}`);
  }

  async close(): Promise<void> {
    await this.channel?.close();
    this.channel = undefined;

    await this.connection?.close();
    this.connection = undefined;
  }
}
