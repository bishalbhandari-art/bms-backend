import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      table: 'authors',
    },
    indexes: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      authors_email_key: {
        keys: {email: 1},
        options: {unique: true},
      },
    },
  },
})
export class Author extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      dataType: 'INTEGER',
    },
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  author_id?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      dataType: 'VARCHAR',
      dataLength: 100,
    },
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      dataType: 'VARCHAR',
      dataLength: 255,
    },
    jsonSchema: {
      format: 'email',
    },
  })
  email: string;

  @property({
    type: 'date',
    postgresql: {
      dataType: 'TIMESTAMP',
    },
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at?: Date;

  @property({
    type: 'date',
    postgresql: {
      dataType: 'TIMESTAMP',
    },
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  updated_at?: Date;

  constructor(data?: Partial<Author>) {
    super(data);
  }
}

export interface AuthorRelations {}

export type AuthorWithRelations = Author & AuthorRelations;
