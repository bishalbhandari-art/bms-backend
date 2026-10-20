import 'dotenv/config';

import {ApplicationConfig, BookEventsConsumerApplication} from './application';
import {startBookEventsConsumer} from './book-events.consumer';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new BookEventsConsumerApplication(options);

  await app.boot();
  await app.start();
  await startBookEventsConsumer();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3004),
      host: process.env.HOST ?? '0.0.0.0',
      gracePeriodForClose: 5000,
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };

  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
