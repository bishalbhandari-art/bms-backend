// testModels.ts — Verify models are working by fetching all books.
// Run: tsc && node dist/models/testModels.js

import { Book } from './index.js';

async function getBooks(): Promise<void> {
  try {
    const books = await Book.findAll();
    console.log('Books found:', books.length);
    books.forEach((book) => {
      console.log(book.toJSON());
    });
  } catch (error) {
    console.error('Something error in fetching books');
    console.error(error);
  }
}

getBooks();
