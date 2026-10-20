import {expect} from '@loopback/testlab';
import {BooksControllerController} from '../../controllers/books-controller.controller';
import {Book} from '../../models';
import {BookRepository} from '../../repositories';
import {MessageQueueService} from '../../services/message-queue.service';

describe('BooksControllerController reference validation', () => {
  const originalFetch = global.fetch;
  const originalPublishBookCreated =
    MessageQueueService.prototype.publishBookCreated;

  let controller: BooksControllerController;
  let createdBooks: Book[];
  let publishedBooks: Book[];
  function givenBook(): Book {
    return new Book({
      title: 'Unit Test Book',
      isbn: 1234567890,
      author_id: 1,
      category_id: 1,
    });
  }

  beforeEach(() => {
    createdBooks = [];
    publishedBooks = [];

    global.fetch = async () => new Response(null, {status: 200});

    MessageQueueService.prototype.publishBookCreated = async book => {
      publishedBooks.push(book);
    };

    const fakeRepository = {
      create: async (data: Omit<Book, 'id'>): Promise<Book> => {
        const created = new Book({...data, id: 42});
        createdBooks.push(created);
        return created;
      },
    };

    controller = new BooksControllerController(
      fakeRepository as unknown as BookRepository,
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
    MessageQueueService.prototype.publishBookCreated =
      originalPublishBookCreated;
  });

  it('validates both references before persisting and publishing', async () => {
    const requestedUrls: string[] = [];

    global.fetch = async input => {
      requestedUrls.push(String(input));
      return new Response(null, {status: 200});
    };

    const result = await controller.create(givenBook());

    expect(result.id).to.equal(42);
    expect(requestedUrls.some(url => url.endsWith('/authors/1'))).to.equal(
      true,
    );
    expect(requestedUrls.some(url => url.endsWith('/categories/1'))).to.equal(
      true,
    );
    expect(createdBooks).to.have.length(1);
    expect(publishedBooks).to.have.length(1);
  });

  it('rejects a nonexistent author without persisting the book', async () => {
    global.fetch = async input => {
      const url = String(input);
      return new Response(null, {
        status: url.includes('/authors/1') ? 404 : 200,
      });
    };

    const error = await expect(controller.create(givenBook())).to.be.rejected();

    expect(error.statusCode).to.equal(422);
    expect(createdBooks).to.have.length(0);
    expect(publishedBooks).to.have.length(0);
  });

  it('rejects a nonexistent category without persisting the book', async () => {
    global.fetch = async input => {
      const url = String(input);
      return new Response(null, {
        status: url.includes('/categories/1') ? 404 : 200,
      });
    };

    const error = await expect(controller.create(givenBook())).to.be.rejected();

    expect(error.statusCode).to.equal(422);
    expect(createdBooks).to.have.length(0);
    expect(publishedBooks).to.have.length(0);
  });

  it('returns 502 when a reference service is unavailable', async () => {
    global.fetch = async input => {
      if (String(input).includes('/authors/1')) {
        throw new Error('connection refused');
      }

      return new Response(null, {status: 200});
    };

    const error = await expect(controller.create(givenBook())).to.be.rejected();

    expect(error.statusCode).to.equal(502);
    expect(createdBooks).to.have.length(0);
    expect(publishedBooks).to.have.length(0);
  });

  it('returns 504 when a reference service times out', async () => {
    global.fetch = async input => {
      if (String(input).includes('/authors/1')) {
        const error = new Error('request timed out');
        error.name = 'TimeoutError';
        throw error;
      }

      return new Response(null, {status: 200});
    };

    const error = await expect(controller.create(givenBook())).to.be.rejected();

    expect(error.statusCode).to.equal(504);
    expect(createdBooks).to.have.length(0);
    expect(publishedBooks).to.have.length(0);
  });
});
