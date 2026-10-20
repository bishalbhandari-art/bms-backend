// testCrud.ts — Verify CRUD operations (Create, Read, Update, Delete).
// Run: tsc && node dist/models/testCrud.js

import { Book } from './index.js';

async function testCRUD(): Promise<void> {
  try {
    // CREATE
    const newBook = await Book.create({
      title: 'Sequelize Testing Book',
      isbn: '8439493834',
      publish_date: '2015-01-01',
      book_type: 'EBook',
      page_count: null,
      file_size: '43.00',
      author_id: 2,
      category_id: 4,
    });
    console.log('Book Created:');
    console.log(newBook.toJSON());

    // READ
    const book = await Book.findByPk(newBook.id);
    console.log('Book found:');
    console.log(book?.toJSON());

    // UPDATE
    await Book.update(
      { title: 'Verified Book' },
      { where: { id: newBook.id } },
    );
    const updatedBook = await Book.findByPk(newBook.id);
    console.log('Book updated:');
    console.log(updatedBook?.toJSON());

    // DELETE
    await Book.destroy({ where: { id: newBook.id } });
    console.log('Book deleted successfully');
  } catch (error) {
    console.error('Failed CRUD Operations');
    console.error(error);
  }
}

testCRUD();
