// testTransaction.ts — Verify Sequelize transactions (commit & rollback).
// Run: tsc && node dist/models/testTransaction.js

import { sequelize, Book } from './index.js';
import { Transaction } from 'sequelize';

async function testTransaction(): Promise<void> {
  const transaction: Transaction = await sequelize.transaction();
  try {
    const newBook = await Book.create(
      {
        title: 'Testing Transaction dummy Book',
        isbn: '8234567987',
        publish_date: '2025-01-01',
        book_type: 'Printed',
        page_count: 56,
        file_size: null,
        author_id: 1,
        category_id: 3,
      },
      { transaction },
    );

    console.log('Book created inside transaction');
    console.log(newBook.toJSON());

    // for COMMIT
    // await transaction.commit();
    // console.log('Transaction committed successfully!');

    // Force ROLLBACK to demonstrate rollback behavior
    throw new Error('Something went wrong in it! Rolling back transaction');
  } catch (error) {
    await transaction.rollback();
    console.error('Transaction rolled back!');
    console.error(error instanceof Error ? error.message : error);
  } finally {
    await sequelize.close();
  }
}

testTransaction();
