import {expect} from '@loopback/testlab';
import {AuthorsControllerController} from '../../controllers/authors-controller.controller';
import {Author} from '../../models';
import {AuthorRepository} from '../../repositories';

describe('AuthorsControllerController', () => {
  const author = new Author({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    author_id: 7,
    name: 'Jane Austen',
    email: 'jane@example.com',
  });
  let controller: AuthorsControllerController;
  let calls: Array<{method: string; args: unknown[]}>;

  const record = (method: string, ...args: unknown[]): void => {
    calls.push({method, args});
  };

  beforeEach(() => {
    calls = [];

    const fakeRepository = {
      create: async (input: unknown) => {
        record('create', input);
        return author;
      },
      count: async (where?: unknown) => {
        record('count', where);
        return {count: 3};
      },
      find: async (filter?: unknown) => {
        record('find', filter);
        return [author];
      },
      updateAll: async (input: unknown, where?: unknown) => {
        record('updateAll', input, where);
        return {count: 1};
      },
      findById: async (id: number, filter?: unknown) => {
        record('findById', id, filter);
        return author;
      },
      updateById: async (id: number, input: unknown) => {
        record('updateById', id, input);
      },
      replaceById: async (id: number, input: unknown) => {
        record('replaceById', id, input);
      },
      deleteById: async (id: number) => {
        record('deleteById', id);
      },
    };

    controller = new AuthorsControllerController(
      fakeRepository as unknown as AuthorRepository,
    );
  });

  it('creates an author through the repository', async () => {
    const input = new Author({
      name: 'Jane Austen',
      email: 'jane@example.com',
    });

    const result = await controller.create(
      input as unknown as Omit<Author, 'author_id'>,
    );

    expect(result.author_id).to.equal(7);
    expect(calls[0].method).to.equal('create');
    expect(calls[0].args[0]).to.equal(input);
  });

  it('returns the author count', async () => {
    const result = await controller.count();

    expect(result.count).to.equal(3);
    expect(calls[0].method).to.equal('count');
  });

  it('lists authors through the repository', async () => {
    const result = await controller.find();

    expect(result).to.have.length(1);
    expect(result[0].name).to.equal('Jane Austen');
    expect(calls[0].method).to.equal('find');
  });

  it('retrieves an author by ID', async () => {
    const result = await controller.findById(7);

    expect(result.author_id).to.equal(7);
    expect(calls[0]).to.deepEqual({
      method: 'findById',
      args: [7, undefined],
    });
  });

  it('performs a bulk update', async () => {
    const result = await controller.updateAll(author);

    expect(result.count).to.equal(1);
    expect(calls[0].method).to.equal('updateAll');
  });

  it('updates an author by ID', async () => {
    await controller.updateById(7, author);

    expect(calls[0]).to.deepEqual({
      method: 'updateById',
      args: [7, author],
    });
  });

  it('replaces an author by ID', async () => {
    await controller.replaceById(7, author);

    expect(calls[0]).to.deepEqual({
      method: 'replaceById',
      args: [7, author],
    });
  });

  it('deletes an author by ID', async () => {
    await controller.deleteById(7);

    expect(calls[0]).to.deepEqual({
      method: 'deleteById',
      args: [7],
    });
  });
});
