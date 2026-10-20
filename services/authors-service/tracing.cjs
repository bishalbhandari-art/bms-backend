'use strict';

require('dotenv').config();

const {NodeSDK} = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');

const serviceName =
  process.env.OTEL_SERVICE_NAME ||
  process.env.SERVICE_NAME ||
  'bms-service';

const tracesEndpoint =
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
  'http://localhost:4318/v1/traces';

const sdk = new NodeSDK({
  serviceName,
  traceExporter: new OTLPTraceExporter({
    url: tracesEndpoint,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log(
  `[OpenTelemetry] Tracing initialized for ${serviceName}`,
);