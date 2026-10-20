import {expect} from '@loopback/testlab';
import {BooksApiService} from '../../services/books-api.service';

describe('BooksApiService upstream handling', () => {
  const service = new BooksApiService();
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns books when Books Service responds successfully', async () => {
    const books = [{id: 1, title: 'Gateway Test'}];

    global.fetch = async () =>
      new Response(JSON.stringify(books), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      });

    const result = await service.getBooks();

    expect(result).to.deepEqual(books);
  });

  it('preserves an upstream error status without exposing its response body', async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          error: {message: 'secret stack details'},
        }),
        {status: 500},
      );

    const error = await expect(service.getBooks()).to.be.rejected();

    expect(error.statusCode).to.equal(500);
    expect(error.message).to.not.containEql('secret stack details');
  });

  it('returns 404 when a requested book does not exist', async () => {
    global.fetch = async () => new Response(null, {status: 404});

    const error = await expect(service.getBookById(99)).to.be.rejected();

    expect(error.statusCode).to.equal(404);
    expect(error.message).to.equal('Book 99 not found');
  });

  it('maps invalid book data to HTTP 422', async () => {
    global.fetch = async () => new Response('{}', {status: 422});

    const error = await expect(
      service.createBook({title: ''}),
    ).to.be.rejected();

    expect(error.statusCode).to.equal(422);
    expect(error.message).to.equal('Book data is invalid');
  });

  it('maps an unavailable Books Service to HTTP 502', async () => {
    global.fetch = async () => {
      throw new Error('connection refused');
    };

    const error = await expect(service.getBooks()).to.be.rejected();

    expect(error.statusCode).to.equal(502);
    expect(error.message).to.equal('Books Service is unavailable');
  });

  it('maps a timed-out Books Service request to HTTP 504', async () => {
    const configurable = service as unknown as {
      requestTimeoutMs: number;
    };
    configurable.requestTimeoutMs = 10;

    global.fetch = async (_input, options) =>
      new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener(
          'abort',
          () => reject(options?.signal?.reason),
          {once: true},
        );
      });

    try {
      const error = await expect(service.getBooks()).to.be.rejected();

      expect(error.statusCode).to.equal(504);
      expect(error.message).to.equal('Books Service request timed out');
    } finally {
      configurable.requestTimeoutMs = 5000;
    }
  });
});
