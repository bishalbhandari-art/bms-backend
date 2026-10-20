// testRelationships.ts — Verify model relationships with eager loading.
// Run: tsc && node dist/models/testRelationships.js

import { Book, Author, Category } from './index.js';

async function getBooksDetails(): Promise<void> {
  try {
    const books = await Book.findAll({
      include: [
        { model: Author, as: 'author' },
        { model: Category, as: 'category' },
      ],
    });

    console.log('Books with author and category:');
    books.forEach((book) => {
      const plain = book.toJSON() as Record<string, any>;
      console.log({
        title: plain.title,
        author: plain.author?.name,
        category: plain.category?.name,
      });
    });
  } catch (error) {
    console.error('Unable to fetch books detail');
    console.error(error);
  }
}

getBooksDetails();
