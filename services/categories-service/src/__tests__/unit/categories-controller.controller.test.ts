import {expect} from '@loopback/testlab';
import {CategoriesControllerController} from '../../controllers/categories-controller.controller';
import {Category} from '../../models';
import {CategoryRepository} from '../../repositories';

describe('CategoriesControllerController', () => {
  const category = new Category({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    category_id: 4,
    name: 'Fantasy',
  });

  let controller: CategoriesControllerController;
  let calls: Array<{method: string; args: unknown[]}>;

  beforeEach(() => {
    calls = [];

    const record = (method: string, ...args: unknown[]): void => {
      calls.push({method, args});
    };

    const fakeRepository = {
      create: async (input: unknown) => {
        record('create', input);
        return category;
      },
      count: async (where?: unknown) => {
        record('count', where);
        return {count: 3};
      },
      find: async (filter?: unknown) => {
        record('find', filter);
        return [category];
      },
      updateAll: async (input: unknown, where?: unknown) => {
        record('updateAll', input, where);
        return {count: 1};
      },
      findById: async (id: number, filter?: unknown) => {
        record('findById', id, filter);
        return category;
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

    controller = new CategoriesControllerController(
      fakeRepository as unknown as CategoryRepository,
    );
  });

  it('creates a category through the repository', async () => {
    const input = new Category({name: 'Fantasy'});

    const result = await controller.create(
      input as unknown as Omit<Category, 'category_id'>,
    );

    expect(result.category_id).to.equal(4);
    expect(calls[0].method).to.equal('create');
    expect(calls[0].args[0]).to.equal(input);
  });

  it('returns the category count', async () => {
    const result = await controller.count();

    expect(result.count).to.equal(3);
    expect(calls[0].method).to.equal('count');
  });

  it('lists categories through the repository', async () => {
    const result = await controller.find();

    expect(result).to.have.length(1);
    expect(result[0].name).to.equal('Fantasy');
    expect(calls[0].method).to.equal('find');
  });

  it('retrieves a category by ID', async () => {
    const result = await controller.findById(4);

    expect(result.category_id).to.equal(4);
    expect(calls[0]).to.deepEqual({
      method: 'findById',
      args: [4, undefined],
    });
  });

  it('performs a bulk update', async () => {
    const result = await controller.updateAll(category);

    expect(result.count).to.equal(1);
    expect(calls[0].method).to.equal('updateAll');
  });

  it('updates a category by ID', async () => {
    await controller.updateById(4, category);

    expect(calls[0]).to.deepEqual({
      method: 'updateById',
      args: [4, category],
    });
  });

  it('replaces a category by ID', async () => {
    await controller.replaceById(4, category);

    expect(calls[0]).to.deepEqual({
      method: 'replaceById',
      args: [4, category],
    });
  });

  it('deletes a category by ID', async () => {
    await controller.deleteById(4);

    expect(calls[0]).to.deepEqual({
      method: 'deleteById',
      args: [4],
    });
  });
});
