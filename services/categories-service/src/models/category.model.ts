import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      table: 'categories',
    },
    indexes: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      categories_name_key: {
        keys: {name: 1},
        options: {unique: true},
      },
    },
  },
})
export class Category extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      dataType: 'INTEGER',
    },
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  category_id?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      dataType: 'VARCHAR',
      dataLength: 100,
    },
  })
  name: string;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {}

export type CategoryWithRelations = Category & CategoryRelations;
