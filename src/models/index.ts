// Central model registry: imports every model, wires up the associations that
// mirror the schema's foreign keys, and re-exports everything (plus the shared
// sequelize instance) so the rest of the app has one import point.
import { sequelize } from '../config/database.js';
import { Author } from './author.js';
import { Category } from './category.js';
import { Book } from './book.js';

// Author 1 ──< Many Books  (books.author_id -> authors.author_id)
Author.hasMany(Book, { foreignKey: 'author_id', as: 'books' });
Book.belongsTo(Author, { foreignKey: 'author_id', as: 'author' });

// Category 1 ──< Many Books (books.category_id -> categories.category_id)
Category.hasMany(Book, { foreignKey: 'category_id', as: 'books' });
Book.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

export { sequelize, Author, Category, Book };
