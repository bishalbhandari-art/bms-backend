import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  HttpErrors,
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
import {Book} from '../models';
import {BookRepository} from '../repositories';
import {MessageQueueService} from '../services/message-queue.service';
import {logger} from '../services/logger.service';

export class BooksControllerController {
  private readonly messageQueue = new MessageQueueService();
  constructor(
    @repository(BookRepository)
    public bookRepository: BookRepository,
  ) {}
  private readonly authorsServiceUrl =
    process.env.AUTHORS_SERVICE_URL ?? 'http://localhost:3002';

  private readonly categoriesServiceUrl =
    process.env.CATEGORIES_SERVICE_URL ?? 'http://localhost:3003';

  private async assertResourceExists(
    url: string,
    resource: string,
    id: number,
  ): Promise<void> {
    let result: Response;

    try {
      result = await fetch(`${url}/${resource}/${id}`, {
        signal: AbortSignal.timeout(5000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new HttpErrors.GatewayTimeout(`${resource} service timed out`);
      }

      throw new HttpErrors.BadGateway(`${resource} service is unavailable`);
    }

    if (result.status === 404) {
      throw new HttpErrors.UnprocessableEntity(
        `${resource} with id ${id} does not exist`,
      );
    }

    if (!result.ok) {
      throw new HttpErrors.BadGateway(
        `${resource} service returned HTTP ${result.status}`,
      );
    }
  }

  private async validateBookReferences(book: Omit<Book, 'id'>): Promise<void> {
    await Promise.all([
      this.assertResourceExists(
        this.authorsServiceUrl,
        'authors',
        book.author_id,
      ),
      this.assertResourceExists(
        this.categoriesServiceUrl,
        'categories',
        book.category_id,
      ),
    ]);
  }
  @post('/books')
  @response(200, {
    description: 'Book model instance',
    content: {'application/json': {schema: getModelSchemaRef(Book)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {
            title: 'NewBook',
            exclude: ['id'],
          }),
        },
      },
    })
    book: Omit<Book, 'id'>,
  ): Promise<Book> {
    await this.validateBookReferences(book);

    const createdBook = await this.bookRepository.create(book);

    await this.messageQueue.publishBookCreated(createdBook);

    logger.info('Book created successfully', {
      bookId: createdBook.id,
      eventType: 'book.created',
    });

    return createdBook;
  }
  @get('/books/count')
  @response(200, {
    description: 'Book model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Book) where?: Where<Book>): Promise<Count> {
    return this.bookRepository.count(where);
  }

  @get('/books')
  @response(200, {
    description: 'Array of Book model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Book, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Book) filter?: Filter<Book>): Promise<Book[]> {
    return this.bookRepository.find(filter);
  }

  @patch('/books')
  @response(200, {
    description: 'Book PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {partial: true}),
        },
      },
    })
    book: Book,
    @param.where(Book) where?: Where<Book>,
  ): Promise<Count> {
    return this.bookRepository.updateAll(book, where);
  }

  @get('/books/{id}')
  @response(200, {
    description: 'Book model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Book, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Book, {exclude: 'where'}) filter?: FilterExcludingWhere<Book>,
  ): Promise<Book> {
    return this.bookRepository.findById(id, filter);
  }

  @patch('/books/{id}')
  @response(204, {
    description: 'Book PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Book, {partial: true}),
        },
      },
    })
    book: Book,
  ): Promise<void> {
    await this.bookRepository.updateById(id, book);
  }

  @put('/books/{id}')
  @response(204, {
    description: 'Book PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() book: Book,
  ): Promise<void> {
    await this.bookRepository.replaceById(id, book);
  }

  @del('/books/{id}')
  @response(204, {
    description: 'Book DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bookRepository.deleteById(id);
  }
}
