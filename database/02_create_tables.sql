-- BMS Database — Table Creation
-- Creates three tables: authors, categories, books
-- Drop tables if they already exist (reverse dependency order)
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS authors;
-- Authors table
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE
);
-- Categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
-- Books table (references authors and categories)
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    publish_date DATE,
    book_type VARCHAR(20) CHECK (book_type IN ('Printed', 'EBook')),
    page_count INTEGER CHECK (page_count > 0),
    file_size VARCHAR(20),
    author_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    CONSTRAINT fk_book_author FOREIGN KEY (author_id) REFERENCES authors (author_id) ON DELETE RESTRICT,
    CONSTRAINT fk_book_category FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT
);