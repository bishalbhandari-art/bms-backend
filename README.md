# Book Management System â€” Assignment 14

This repository contains a Book Management System built from five Node.js and LoopBack 4 services, PostgreSQL, RabbitMQ, and a Docker Compose development stack. It also retains a standalone Sequelize example and SQL exercises at the repository root.

## What the project implements

- Book, author, and category CRUD APIs.
- An API Gateway that exposes the main application API and forwards requests to the domain services.
- Separate PostgreSQL databases for books, authors, and categories. Before creating a book, Books Service checks that its author and category exist through REST calls.
- A `book.created` RabbitMQ event and a consumer with a five-second retry queue and dead-letter queue.
- Prometheus metrics endpoints, a provisioned Grafana data source and dashboard, structured logs sent to OpenSearch, and OpenTelemetry traces sent to Jaeger.
- Docker Compose configuration for running the application and observability services locally.

## Services and ports

| Component | Host port | Responsibility |
|---|---:|---|
| API Gateway | 3000 | Main client entry point; forwards book, author, and category requests |
| Books Service | Internal 3000 | Book CRUD, reference checks, PostgreSQL persistence, and event publishing |
| Authors Service | 3002 | Author CRUD and persistence in `authors_db` |
| Categories Service | 3003 | Category CRUD and persistence in `categories_db` |
| Book Events Consumer | 3004 | Consumes `book.created` messages and exposes health and metrics endpoints |
| PostgreSQL | 5433 | Hosts `books_db`, `authors_db`, `categories_db`, and the root Sequelize database |
| RabbitMQ | 5672 | Application message broker |
| RabbitMQ Management UI | 15672 | Local broker administration |
| Prometheus | 9090 | Scrapes application metrics |
| Grafana | 3005 | Displays the provisioned monitoring dashboard |
| Jaeger UI | 16686 | Trace search and visualization |
| Jaeger OTLP | 4317, 4318 | Trace ingestion |
| OpenSearch | 9200 | Centralized application logs |
| OpenSearch Dashboards | 5601 | Log exploration |

Books Service is reachable to the other Compose containers on port 3000; Compose does not publish that port to the host. Authors and Categories Services also have direct host ports for local development, while the gateway is the normal client entry point.

## Request and event flow

The gateway exposes the application routes under `/api`. For book creation, it forwards the request to Books Service. Books Service checks the supplied `author_id` and `category_id` against Authors and Categories Services, stores the book, then publishes a persistent `book.created` message to the durable `bms.events` topic exchange.

The Book Events Consumer reads from the durable `bms.book.events` queue. Failed messages are retried through `bms.book.events.retry`, which has a five-second TTL. After three retry cycles, a message that still fails is sent to `bms.book.events.dlq` through the dead-letter exchange. The consumer logs processing, retry, and dead-letter outcomes.

## API routes

The API Gateway is available at `http://127.0.0.1:3000`:

| Resource | Routes |
|---|---|
| Books | `GET /api/books`, `GET /api/books/{id}`, `POST /api/books`, `PATCH /api/books/{id}`, `DELETE /api/books/{id}` |
| Authors | `GET /api/authors`, `GET /api/authors/{id}`, `POST /api/authors`, `PATCH /api/authors/{id}`, `DELETE /api/authors/{id}` |
| Categories | `GET /api/categories`, `GET /api/categories/{id}`, `POST /api/categories`, `PATCH /api/categories/{id}`, `DELETE /api/categories/{id}` |

`GET /ping` is the gateway health check. The LoopBack API explorer is at `/explorer`; `/metrics` exposes Prometheus metrics. Each application service also provides `/ping`, `/explorer`, and `/metrics` on its own port.

Create authors with `name` and `email`, categories with `name`, and books with `title`, `isbn`, `author_id`, and `category_id`. Book fields such as `publish_date`, `book_type`, `page_count`, and `file_size` are optional in the model.

## Start the local Compose stack

### Prerequisites

- Docker Desktop with Docker Compose
- Node.js 20, 22, or 24 for local service development

### Configure environment files

Tracked `.env.example` templates are provided at the repository root and in each of the five service directories. They contain placeholders only; never put real credentials in these example files.

For Windows PowerShell, copy the templates to create your local environment files:

```powershell
Copy-Item .env.example .env
Copy-Item .\services\api-gateway\.env.example .\services\api-gateway\.env
Copy-Item .\services\books-service\.env.example .\services\books-service\.env
Copy-Item .\services\authors-service\.env.example .\services\authors-service\.env
Copy-Item .\services\categories-service\.env.example .\services\categories-service\.env
Copy-Item .\services\book-events-consumer\.env.example .\services\book-events-consumer\.env
```

Edit the newly created `.env` files before starting the stack. Replace every placeholder password with a private, non-empty value. Keep PostgreSQL and RabbitMQ credentials consistent wherever the services use them.

The root `.env` supplies Docker Compose variables and root Sequelize configuration. Service-specific `.env` files supply each application's configuration.

Use `DB_NAME=bms_database` for the root Sequelize example. For the microservices, use `books_db`, `authors_db`, and `categories_db` for the respective database names. Inside Docker Compose, services connect to PostgreSQL using its Compose hostname and internal port `5432`; tools running on Windows use the published PostgreSQL port `5433`.

Keep actual `.env` files out of version control. Only the `.env.example` templates should be shared. Never commit real passwords or other secrets.

The PostgreSQL init script creates the three service databases on the first initialization of its data volume. Compose does **not** automatically create the service tables. Start the stack, then run each service migration once:

```bash
docker compose config
docker compose up -d --build
docker compose exec books-service npm run migrate
docker compose exec authors-service npm run migrate
docker compose exec categories-service npm run migrate
docker compose ps
```

The migration commands use the default non-drop schema migration. Do not add `--rebuild` unless you intend to drop and recreate a service schema.

View application logs:

```bash
docker compose logs --tail 100 api-gateway books-service book-events-consumer
```

Stop the stack while retaining named volumes and their data:

```bash
docker compose down
```

Use `docker compose down -v` only when you intend to remove the stored database, broker, logs, metrics, and Grafana data.

## Local tools

| Tool | URL |
|---|---|
| API Gateway | <http://127.0.0.1:3000> |
| Authors Service | <http://127.0.0.1:3002> |
| Categories Service | <http://127.0.0.1:3003> |
| Book Events Consumer | <http://127.0.0.1:3004> |
| Grafana | <http://127.0.0.1:3005> |
| Prometheus | <http://127.0.0.1:9090> |
| Jaeger | <http://127.0.0.1:16686> |
| OpenSearch | <http://127.0.0.1:9200> |
| OpenSearch Dashboards | <http://127.0.0.1:5601> |
| RabbitMQ Management UI | <http://127.0.0.1:15672> |

## Logging, metrics, and tracing

- **Logging:** Services write structured Winston logs to the console and OpenSearch. Indices use the `bms-logs-YYYY-MM-DD` naming pattern.
- **Metrics:** Prometheus scrapes `/metrics` on all five application services. These endpoints expose default Node.js metrics and a `bms_service_info` gauge. Event outcomes are logged; the consumer does not currently define custom consumed, failed, or retried event counters.
- **Grafana:** Compose provisions Prometheus as a data source and loads the dashboard JSON from `monitoring/grafana/dashboards`.
- **Tracing:** Services preload OpenTelemetry instrumentation and export traces to Jaeger over OTLP.

The local Compose file disables the OpenSearch security plugin for development. Use suitable security settings and network restrictions before deploying any part of this stack outside a trusted local environment.

## Repository layout and root SQL project

```text
database/                       Standalone PostgreSQL schema, seed, and query scripts
backups/                        SQL backup artifact
docker/postgres/init/           Compose database initialization script
monitoring/                     Prometheus and Grafana configuration
services/api-gateway/           Public API gateway
services/books-service/         Book domain service
services/authors-service/       Author domain service
services/categories-service/    Category domain service
services/book-events-consumer/  RabbitMQ consumer
src/                            Root Sequelize models, migrations, and seeders
```

The root SQL scripts are a separate, single-database exercise: run `database/01_create_database.sql`, then connect to `bms_database` and run `02_create_tables.sql`, `03_insert_data.sql`, and optionally `04_queries.sql`. The table script drops existing tables before recreating them, and the seed script truncates existing rows; back up data before running either script against a database you want to preserve.

The root TypeScript project is a separate Sequelize/CLI implementation. From the repository root, use `npm ci`, configure `.env`, then `npm run migrate` and optionally `npm run seed`. `npm run start` checks the database connection and reports record counts; it does not start the microservices API. The root package also provides `npm run build`, `npm run typecheck`, and `npm run migrate:undo`.

## Tests and quality checks

Each service has its own `package.json` and lockfile. From a service directory, install dependencies and run its available checks:

```bash
npm ci
npm test
npm run lint
npm run build
```

The service test scripts rebuild the TypeScript output before running the acceptance tests; their post-test script also runs lint. Run these commands separately in `services/api-gateway`, `services/books-service`, `services/authors-service`, `services/categories-service`, and `services/book-events-consumer`.

## Assignment scope and deployment

The repository implements the local microservices, PostgreSQL persistence, REST communication, RabbitMQ event flow, retry/dead-letter handling, Docker Compose setup, and observability configuration described above. It contains no AWS deployment configuration or verified deployed API endpoint, so AWS region and endpoint details are not listed here. Authentication and authorization, including JWT, are not implemented in the current application code and are outside the stated Assignment 14 scope.

Never commit database passwords, RabbitMQ credentials, Grafana credentials, or other secrets. Use ignored local `.env` files for development and an appropriate secrets manager for deployed environments.
