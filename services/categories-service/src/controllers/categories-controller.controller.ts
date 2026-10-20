import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';

import {Category} from '../models';
import {CategoryRepository} from '../repositories';
import {logger} from '../services/logger.service';

export class CategoriesControllerController {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) {}

  private async withLogging<T>(
    operation: string,
    context: Record<string, unknown>,
    action: () => Promise<T>,
    getSuccessContext?: (result: T) => Record<string, unknown>,
  ): Promise<T> {
    try {
      const result = await action();

      logger.info(`Category ${operation} succeeded`, {
        ...context,
        ...(getSuccessContext ? getSuccessContext(result) : {}),
      });

      return result;
    } catch (error) {
      logger.error(`Category ${operation} failed`, {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  @post('/categories')
  @response(200, {
    description: 'Category model instance',
    content: {'application/json': {schema: getModelSchemaRef(Category)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Category, {
            title: 'NewCategory',
            exclude: ['category_id'],
          }),
        },
      },
    })
    category: Omit<Category, 'category_id'>,
  ): Promise<Category> {
    return this.withLogging(
      'create',
      {operationType: 'create'},
      () => this.categoryRepository.create(category),
      result => ({categoryId: result.category_id}),
    );
  }

  @get('/categories/count')
  @response(200, {
    description: 'Category model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Category) where?: Where<Category>): Promise<Count> {
    return this.withLogging(
      'count',
      {operationType: 'count'},
      () => this.categoryRepository.count(where),
      result => ({count: result.count}),
    );
  }

  @get('/categories')
  @response(200, {
    description: 'Array of Category model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Category, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Category) filter?: Filter<Category>,
  ): Promise<Category[]> {
    return this.withLogging(
      'list',
      {operationType: 'list'},
      () => this.categoryRepository.find(filter),
      result => ({resultCount: result.length}),
    );
  }

  @patch('/categories')
  @response(200, {
    description: 'Category PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Category, {partial: true}),
        },
      },
    })
    category: Category,
    @param.where(Category) where?: Where<Category>,
  ): Promise<Count> {
    return this.withLogging(
      'bulk update',
      {operationType: 'bulk-update'},
      () => this.categoryRepository.updateAll(category, where),
      result => ({updatedCount: result.count}),
    );
  }

  @get('/categories/{id}')
  @response(200, {
    description: 'Category model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Category, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Category, {exclude: 'where'})
    filter?: FilterExcludingWhere<Category>,
  ): Promise<Category> {
    return this.withLogging(
      'retrieve',
      {categoryId: id, operationType: 'retrieve'},
      () => this.categoryRepository.findById(id, filter),
    );
  }

  @patch('/categories/{id}')
  @response(204, {
    description: 'Category PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Category, {partial: true}),
        },
      },
    })
    category: Category,
  ): Promise<void> {
    return this.withLogging(
      'update',
      {categoryId: id, operationType: 'update'},
      () => this.categoryRepository.updateById(id, category),
    );
  }

  @put('/categories/{id}')
  @response(204, {
    description: 'Category PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() category: Category,
  ): Promise<void> {
    return this.withLogging(
      'replace',
      {categoryId: id, operationType: 'replace'},
      () => this.categoryRepository.replaceById(id, category),
    );
  }

  @del('/categories/{id}')
  @response(204, {
    description: 'Category DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    return this.withLogging(
      'delete',
      {categoryId: id, operationType: 'delete'},
      () => this.categoryRepository.deleteById(id),
    );
  }
}
