import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { sequelize } from '../config/database.js';
import { Author } from './author.js';
import { Category } from './category.js';

// Book model: maps to the `books` table.
// Links to Author (author_id) and Category (category_id).
// Validations check basic fields; database constraints enforce business rules.
export class Book extends Model<
  InferAttributes<Book>,
  InferCreationAttributes<Book>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare isbn: string; // NUMERIC — Sequelize returns DECIMAL as a string
  declare publish_date: CreationOptional<string | null>;
  declare book_type: CreationOptional<string | null>;
  declare page_count: CreationOptional<number | null>;
  declare file_size: CreationOptional<string | null>;
  declare author_id: ForeignKey<Author['author_id']>;
  declare category_id: ForeignKey<Category['category_id']>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Book.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    isbn: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      unique: true,
    },
    publish_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    book_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: { isIn: [['Printed', 'EBook']] },
    },
    page_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1 },
    },
    file_size: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      validate: { min: 0.01 },
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'authors', key: 'author_id' },
      onDelete: 'RESTRICT',
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'categories', key: 'category_id' },
      onDelete: 'RESTRICT',
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'books',
  },
);
