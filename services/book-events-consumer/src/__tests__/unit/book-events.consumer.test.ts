import {expect} from '@loopback/testlab';
import {EventEmitter} from 'events';
import amqp from 'amqplib';
import type {ChannelModel, ConfirmChannel, ConsumeMessage} from 'amqplib';
import {startBookEventsConsumer} from '../../book-events.consumer';

describe('Book Events Consumer', () => {
  const amqpModule = amqp as unknown as {
    connect: (url: string) => Promise<ChannelModel>;
  };
  const originalConnect = amqpModule.connect;
  const queueName = process.env.RABBITMQ_QUEUE ?? 'bms.book.events';

  afterEach(() => {
    amqpModule.connect = originalConnect;
  });

  function installMockBroker() {
    const calls: Array<{name: string; args: unknown[]}> = [];
    let consumerCallback:
      ((message: ConsumeMessage | null) => void) | undefined;

    const channel = Object.assign(new EventEmitter(), {
      assertExchange: async (...args: unknown[]) => {
        calls.push({name: 'assertExchange', args});
        return {};
      },
      assertQueue: async (...args: unknown[]) => {
        calls.push({name: 'assertQueue', args});
        return {};
      },
      bindQueue: async (...args: unknown[]) => {
        calls.push({name: 'bindQueue', args});
        return {};
      },
      prefetch: async (...args: unknown[]) => {
        calls.push({name: 'prefetch', args});
      },
      consume: async (
        queue: string,
        callback: (message: ConsumeMessage | null) => void,
        options: unknown,
      ) => {
        calls.push({name: 'consume', args: [queue, options]});
        consumerCallback = callback;
        return {consumerTag: 'test-consumer'};
      },
      ack: (message: ConsumeMessage) => {
        calls.push({name: 'ack', args: [message]});
      },
      nack: (message: ConsumeMessage, allUpTo?: boolean, requeue?: boolean) => {
        calls.push({name: 'nack', args: [message, allUpTo, requeue]});
      },
      publish: (
        exchange: string,
        routingKey: string,
        content: Buffer,
        options: unknown,
      ) => {
        calls.push({
          name: 'publish',
          args: [exchange, routingKey, content, options],
        });
        return true;
      },
      waitForConfirms: async () => {
        calls.push({name: 'waitForConfirms', args: []});
      },
      close: async () => undefined,
    }) as unknown as ConfirmChannel;

    const connection = Object.assign(new EventEmitter(), {
      createConfirmChannel: async () => channel,
      close: async () => undefined,
    }) as unknown as ChannelModel;

    amqpModule.connect = async () => connection;

    return {
      calls,
      deliver(message: ConsumeMessage | null) {
        if (!consumerCallback) {
          throw new Error('Consumer callback has not been registered');
        }
        consumerCallback(message);
      },
    };
  }

  function givenMessage(
    body: unknown,
    headers: Record<string, unknown> = {},
  ): ConsumeMessage {
    const serialized = typeof body === 'string' ? body : JSON.stringify(body);

    return {
      content: Buffer.from(serialized ?? ''),
      fields: {routingKey: 'book.created'},
      properties: {headers},
    } as unknown as ConsumeMessage;
  }

  it('declares the durable retry queue with a five-second TTL', async () => {
    const broker = installMockBroker();

    await startBookEventsConsumer();

    const retryQueue = broker.calls.find(
      call =>
        call.name === 'assertQueue' && call.args[0] === `${queueName}.retry`,
    );

    expect(retryQueue?.args[1]).to.deepEqual({
      durable: true,
      arguments: {
        'x-message-ttl': 5000,
        'x-dead-letter-exchange': 'bms.events',
        'x-dead-letter-routing-key': 'book.created',
      },
    });

    expect(
      broker.calls.some(
        call =>
          call.name === 'bindQueue' &&
          call.args[0] === queueName &&
          call.args[2] === 'book.created',
      ),
    ).to.equal(true);
  });

  it('acknowledges a valid book.created event', async () => {
    const broker = installMockBroker();
    await startBookEventsConsumer();

    const message = givenMessage({
      eventId: 'test-1',
      eventType: 'book.created',
      data: {id: 42, title: 'Unit Test Book'},
    });

    broker.deliver(message);

    expect(
      broker.calls.some(
        call => call.name === 'ack' && call.args[0] === message,
      ),
    ).to.equal(true);

    expect(broker.calls.some(call => call.name === 'nack')).to.equal(false);
  });

  it('rejects an invalid event for retry before the retry limit', async () => {
    const broker = installMockBroker();
    await startBookEventsConsumer();

    const message = givenMessage({
      eventType: 'invalid.test',
      data: {id: 42},
    });

    broker.deliver(message);

    expect(
      broker.calls.some(
        call =>
          call.name === 'nack' &&
          call.args[0] === message &&
          call.args[1] === false &&
          call.args[2] === false,
      ),
    ).to.equal(true);

    expect(broker.calls.some(call => call.name === 'ack')).to.equal(false);
  });

  it('moves an event to the dead-letter exchange after three failures', async () => {
    const broker = installMockBroker();
    await startBookEventsConsumer();

    const message = givenMessage(
      {
        eventType: 'invalid.test',
        data: {id: 42},
      },
      {
        'x-death': [{queue: queueName, count: 3}],
      },
    );

    broker.deliver(message);
    await new Promise<void>(resolve => setImmediate(resolve));

    const publishIndex = broker.calls.findIndex(
      call =>
        call.name === 'publish' &&
        call.args[0] === 'bms.events.dlx' &&
        call.args[1] === 'book.created.dead',
    );
    const confirmIndex = broker.calls.findIndex(
      call => call.name === 'waitForConfirms',
    );
    const ackIndex = broker.calls.findIndex(
      call => call.name === 'ack' && call.args[0] === message,
    );

    expect(publishIndex).to.be.greaterThan(-1);
    expect(confirmIndex).to.be.greaterThan(publishIndex);
    expect(ackIndex).to.be.greaterThan(confirmIndex);
  });

  it('schedules malformed JSON for retry', async () => {
    const broker = installMockBroker();
    await startBookEventsConsumer();

    const message = givenMessage('{');

    broker.deliver(message);

    expect(
      broker.calls.some(
        call => call.name === 'nack' && call.args[0] === message,
      ),
    ).to.equal(true);

    expect(broker.calls.some(call => call.name === 'ack')).to.equal(false);
  });
});
