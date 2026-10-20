import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      table: 'books',
    },
    indexes: {
      books_isbn_key: {
        keys: {isbn: 1},
        options: {unique: true},
      },
    },
  },
})
export class Book extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      dataType: 'INTEGER',
    },
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      dataType: 'VARCHAR',
      dataLength: 200,
    },
  })
  title: string;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: 'NUMERIC',
    },
  })
  isbn: number;

  @property({
    type: 'date',
    postgresql: {
      dataType: 'DATE',
    },
  })
  publish_date?: Date;

  @property({
    type: 'string',
    jsonSchema: {
      enum: ['Printed', 'EBook'],
    },
    postgresql: {
      dataType: 'VARCHAR',
      dataLength: 20,
    },
  })
  book_type?: string;

  @property({
    type: 'number',
    postgresql: {
      dataType: 'INTEGER',
    },
    jsonSchema: {
      type: 'integer',
      minimum: 1,
    },
  })
  page_count?: number;

  @property({
    type: 'number',
    postgresql: {
      dataType: 'DECIMAL',
      dataPrecision: 6,
      dataScale: 2,
    },
    jsonSchema: {
      exclusiveMinimum: 0,
    },
  })
  file_size?: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: 'INTEGER',
    },
    jsonSchema: {
      type: 'integer',
    },
  })
  author_id: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: 'INTEGER',
    },
    jsonSchema: {
      type: 'integer',
    },
  })
  category_id: number;

  @property({
    type: 'date',
    defaultFn: 'now',
    postgresql: {
      dataType: 'TIMESTAMP',
    },
  })
  created_at?: Date;

  @property({
    type: 'date',
    defaultFn: 'now',
    postgresql: {
      dataType: 'TIMESTAMP',
    },
  })
  updated_at?: Date;

  constructor(data?: Partial<Book>) {
    super(data);
  }
}

export interface BookRelations {}

export type BookWithRelations = Book & BookRelations;
