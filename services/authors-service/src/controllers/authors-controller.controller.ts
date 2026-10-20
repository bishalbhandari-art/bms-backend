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

import {Author} from '../models';
import {AuthorRepository} from '../repositories';
import {logger} from '../services/logger.service';

export class AuthorsControllerController {
  constructor(
    @repository(AuthorRepository)
    public authorRepository: AuthorRepository,
  ) {}

  private async withLogging<T>(
    operation: string,
    context: Record<string, unknown>,
    action: () => Promise<T>,
    getSuccessContext?: (result: T) => Record<string, unknown>,
  ): Promise<T> {
    try {
      const result = await action();

      logger.info(`Author ${operation} succeeded`, {
        ...context,
        ...(getSuccessContext ? getSuccessContext(result) : {}),
      });

      return result;
    } catch (error) {
      logger.error(`Author ${operation} failed`, {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  @post('/authors')
  @response(200, {
    description: 'Author model instance',
    content: {'application/json': {schema: getModelSchemaRef(Author)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Author, {
            title: 'NewAuthor',
            exclude: ['author_id'],
          }),
        },
      },
    })
    author: Omit<Author, 'author_id'>,
  ): Promise<Author> {
    return this.withLogging(
      'create',
      {operationType: 'create'},
      () => this.authorRepository.create(author),
      result => ({authorId: result.author_id}),
    );
  }

  @get('/authors/count')
  @response(200, {
    description: 'Author model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Author) where?: Where<Author>): Promise<Count> {
    return this.withLogging(
      'count',
      {operationType: 'count'},
      () => this.authorRepository.count(where),
      result => ({count: result.count}),
    );
  }

  @get('/authors')
  @response(200, {
    description: 'Array of Author model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Author, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Author) filter?: Filter<Author>): Promise<Author[]> {
    return this.withLogging(
      'list',
      {operationType: 'list'},
      () => this.authorRepository.find(filter),
      result => ({resultCount: result.length}),
    );
  }

  @patch('/authors')
  @response(200, {
    description: 'Author PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Author, {partial: true}),
        },
      },
    })
    author: Author,
    @param.where(Author) where?: Where<Author>,
  ): Promise<Count> {
    return this.withLogging(
      'bulk update',
      {operationType: 'bulk-update'},
      () => this.authorRepository.updateAll(author, where),
      result => ({updatedCount: result.count}),
    );
  }

  @get('/authors/{id}')
  @response(200, {
    description: 'Author model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Author, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Author, {exclude: 'where'})
    filter?: FilterExcludingWhere<Author>,
  ): Promise<Author> {
    return this.withLogging(
      'retrieve',
      {authorId: id, operationType: 'retrieve'},
      () => this.authorRepository.findById(id, filter),
    );
  }

  @patch('/authors/{id}')
  @response(204, {
    description: 'Author PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Author, {partial: true}),
        },
      },
    })
    author: Author,
  ): Promise<void> {
    return this.withLogging(
      'update',
      {authorId: id, operationType: 'update'},
      () => this.authorRepository.updateById(id, author),
    );
  }

  @put('/authors/{id}')
  @response(204, {
    description: 'Author PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() author: Author,
  ): Promise<void> {
    return this.withLogging(
      'replace',
      {authorId: id, operationType: 'replace'},
      () => this.authorRepository.replaceById(id, author),
    );
  }

  @del('/authors/{id}')
  @response(204, {
    description: 'Author DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    return this.withLogging(
      'delete',
      {authorId: id, operationType: 'delete'},
      () => this.authorRepository.deleteById(id),
    );
  }
}
