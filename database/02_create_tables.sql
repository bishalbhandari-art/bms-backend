-- BMS Database — Table Creation
-- Creates three tables: authors, categories, books
-- Drop tables if they already exist (reverse dependency order)
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
-- Authors table
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Books table (references authors and categories)
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    isbn NUMERIC NOT NULL UNIQUE,
    -- Reject future dates (typos / not-yet-published) at write time.
    publish_date DATE CHECK (publish_date <= CURRENT_DATE),
    book_type VARCHAR(20) CHECK (book_type IN ('Printed', 'EBook')),
    page_count INTEGER CHECK (page_count > 0),
    -- File size stored as an atomic numeric value (MB) so it can be sorted
    -- and compared. Unit lives in the column name, not the data (keeps 1NF).
    -- NUMERIC(6,2) keeps the fractional part (e.g. 2.50) without float rounding.
    file_size NUMERIC(6, 2) CHECK (file_size > 0),
    author_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    -- Only EBooks have a file: an EBook must carry a size, a Printed book must not.
    CONSTRAINT chk_ebook_file_size CHECK (
        (book_type = 'EBook' AND file_size IS NOT NULL)
        OR (book_type = 'Printed' AND file_size IS NULL)
    ),
    CONSTRAINT fk_book_author FOREIGN KEY (author_id) REFERENCES authors (author_id) ON DELETE RESTRICT,
    CONSTRAINT fk_book_category FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT
);