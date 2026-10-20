'use strict';

// Migration: create the `books` table.
// Matches the existing SQL schema: database/02_create_tables.sql
//
// Columns:
//   id           SERIAL PRIMARY KEY
//   title        VARCHAR(200) NOT NULL
//   isbn         NUMERIC NOT NULL UNIQUE
//   publish_date DATE — CHECK (publish_date <= CURRENT_DATE)
//   book_type    VARCHAR(20) — CHECK IN ('Printed', 'EBook')
//   page_count   INTEGER — CHECK (page_count > 0)
//   file_size    NUMERIC(6,2) — CHECK (file_size > 0)
//   author_id    INTEGER NOT NULL FK → authors.author_id ON DELETE RESTRICT
//   category_id  INTEGER NOT NULL FK → categories.category_id ON DELETE RESTRICT
//
// Also adds the cross-field CHECK constraint chk_ebook_file_size.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('books', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      isbn: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        unique: true,
      },
      publish_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      book_type: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      page_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      file_size: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'authors',
          key: 'author_id',
        },
        onDelete: 'RESTRICT',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'category_id',
        },
        onDelete: 'RESTRICT',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Add the CHECK constraints that match the original SQL schema.
    // queryInterface.createTable doesn't support CHECK directly, so we
    // use raw SQL via queryInterface.sequelize.query().
    await queryInterface.sequelize.query(`
      ALTER TABLE books
        ADD CONSTRAINT chk_publish_date CHECK (publish_date <= CURRENT_DATE);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE books
        ADD CONSTRAINT chk_book_type CHECK (book_type IN ('Printed', 'EBook'));
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE books
        ADD CONSTRAINT chk_page_count CHECK (page_count > 0);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE books
        ADD CONSTRAINT chk_file_size CHECK (file_size > 0);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE books
        ADD CONSTRAINT chk_ebook_file_size CHECK (
          (book_type = 'EBook' AND file_size IS NOT NULL)
          OR (book_type = 'Printed' AND file_size IS NULL)
        );
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('books');
  },
};
