import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'categoriesDb',
  connector: 'postgresql',
  url: '',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'categories_db',
};

@lifeCycleObserver('datasource')
export class CategoriesDbDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'categoriesDb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.categoriesDb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
