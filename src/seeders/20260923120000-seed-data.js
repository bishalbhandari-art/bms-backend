'use strict';

// Seeder: insert sample authors, categories, and books.
// Matches the data from database/03_insert_data.sql

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Insert authors
    await queryInterface.bulkInsert('authors', [
      { name: 'F. Scott Fitzgerald', email: 'fitzgerald@example.com', created_at: new Date(), updated_at: new Date() },
      { name: 'George Orwell', email: 'orwell@example.com', created_at: new Date(), updated_at: new Date() },
      { name: 'Jane Austen', email: 'austen@example.com', created_at: new Date(), updated_at: new Date() },
      { name: 'Harper Lee', email: 'lee@example.com', created_at: new Date(), updated_at: new Date() },
      { name: 'J.R.R. Tolkien', email: 'tolkien@example.com', created_at: new Date(), updated_at: new Date() },
    ]);

    // Insert categories
    await queryInterface.bulkInsert('categories', [
      { name: 'Fiction', created_at: new Date(), updated_at: new Date() },
      { name: 'Non-Fiction', created_at: new Date(), updated_at: new Date() },
      { name: 'Science Fiction', created_at: new Date(), updated_at: new Date() },
      { name: 'Mystery', created_at: new Date(), updated_at: new Date() },
      { name: 'Classic', created_at: new Date(), updated_at: new Date() },
    ]);

    // Insert books
    await queryInterface.bulkInsert('books', [
      { title: 'The Great Gatsby', isbn: 9780743273565, publish_date: '1925-04-10', book_type: 'Printed', page_count: 180, file_size: null, author_id: 1, category_id: 1, created_at: new Date(), updated_at: new Date() },
      { title: 'Tender Is the Night', isbn: 9780684801546, publish_date: '1934-04-12', book_type: 'EBook', page_count: 315, file_size: 2.50, author_id: 1, category_id: 1, created_at: new Date(), updated_at: new Date() },
      { title: '1984', isbn: 9780451152458, publish_date: '1949-06-08', book_type: 'Printed', page_count: 328, file_size: null, author_id: 2, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { title: 'Animal Farm', isbn: 9780451152441, publish_date: '1945-08-17', book_type: 'EBook', page_count: 112, file_size: 1.20, author_id: 2, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { title: 'Pride and Prejudice', isbn: 9780141395182, publish_date: '1813-01-28', book_type: 'Printed', page_count: 432, file_size: null, author_id: 3, category_id: 3, created_at: new Date(), updated_at: new Date() },
      { title: 'Sense and Sensibility', isbn: 9780141399678, publish_date: '1811-10-30', book_type: 'EBook', page_count: 409, file_size: 3.10, author_id: 3, category_id: 3, created_at: new Date(), updated_at: new Date() },
      { title: 'Emma', isbn: 9780141399463, publish_date: '1815-12-23', book_type: 'Printed', page_count: 474, file_size: null, author_id: 3, category_id: 4, created_at: new Date(), updated_at: new Date() },
      { title: 'To Kill a Mockingbird', isbn: 9780061200088, publish_date: '1960-07-11', book_type: 'Printed', page_count: 281, file_size: null, author_id: 4, category_id: 1, created_at: new Date(), updated_at: new Date() },
      { title: 'Go Set a Watchman', isbn: 9780062409850, publish_date: '2015-07-14', book_type: 'EBook', page_count: 278, file_size: 2.80, author_id: 4, category_id: 1, created_at: new Date(), updated_at: new Date() },
      { title: 'The Hobbit', isbn: 9780547428679, publish_date: '1937-09-21', book_type: 'Printed', page_count: 310, file_size: null, author_id: 5, category_id: 5, created_at: new Date(), updated_at: new Date() },
      { title: 'The Fellowship of the Ring', isbn: 9780547428686, publish_date: '1954-07-29', book_type: 'Printed', page_count: 423, file_size: null, author_id: 5, category_id: 5, created_at: new Date(), updated_at: new Date() },
      { title: 'The Two Towers', isbn: 9780547428693, publish_date: '1954-11-11', book_type: 'EBook', page_count: 352, file_size: 3.50, author_id: 5, category_id: 5, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    // Remove in reverse order (books has FKs to the other two)
    await queryInterface.bulkDelete('books', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('authors', null, {});
  },
};
