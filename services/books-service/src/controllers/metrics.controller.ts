import 'dotenv/config';

import {inject} from '@loopback/core';
import {get, response, Response, RestBindings} from '@loopback/rest';
import {collectDefaultMetrics, Gauge, register} from '@prometheus-io/client';

const serviceName = process.env.SERVICE_NAME ?? 'bms-service';

collectDefaultMetrics({
  labels: {service: serviceName},
});

const serviceInfo = new Gauge({
  name: 'bms_service_info',
  help: 'Information about this BMS microservice instance.',
  labelNames: ['service'] as const,
});

serviceInfo.labels({service: serviceName}).set(1);

export class MetricsController {
  @get('/metrics')
  @response(200, {
    description: 'Prometheus metrics',
    content: {
      'text/plain': {
        schema: {type: 'string'},
      },
    },
  })
  async metrics(
    @inject(RestBindings.Http.RESPONSE) httpResponse: Response,
  ): Promise<void> {
    httpResponse.setHeader('Content-Type', register.contentType);
    httpResponse.end(await register.metrics());
  }
}
