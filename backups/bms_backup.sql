--
-- PostgreSQL database dump — bms_database
--

-- Drop tables if they already exist (reverse dependency order)
-- so the backup can be restored repeatedly without "already exists" errors
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS authors CASCADE;

-- Create tables
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE
);
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    isbn NUMERIC NOT NULL UNIQUE,
    publish_date DATE CHECK (publish_date <= CURRENT_DATE),
    book_type VARCHAR(20) CHECK (book_type IN ('Printed', 'EBook')),
    page_count INTEGER CHECK (page_count > 0),
    file_size NUMERIC(6, 2) CHECK (file_size > 0),
    author_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    CONSTRAINT chk_ebook_file_size CHECK (
        (book_type = 'EBook' AND file_size IS NOT NULL)
        OR (book_type = 'Printed' AND file_size IS NULL)
    ),
    CONSTRAINT fk_book_author FOREIGN KEY (author_id) REFERENCES authors (author_id) ON DELETE RESTRICT,
    CONSTRAINT fk_book_category FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT
);

-- Insert data
INSERT INTO authors (name, email)
VALUES ('F. Scott Fitzgerald', 'fitzgerald@example.com'),
    ('George Orwell', 'orwell@example.com'),
    ('Jane Austen', 'austen@example.com'),
    ('Harper Lee', 'lee@example.com'),
    ('J.R.R. Tolkien', 'tolkien@example.com');

INSERT INTO categories (name)
VALUES ('Fiction'),
    ('Non-Fiction'),
    ('Science Fiction'),
    ('Mystery'),
    ('Classic');

INSERT INTO books (title, isbn, publish_date, book_type, page_count, file_size, author_id, category_id)
VALUES
    ('The Great Gatsby',           9780743273565, '1925-04-10', 'Printed', 180, NULL, 1, 1),
    ('Tender Is the Night',        9780684801546, '1934-04-12', 'EBook',   315, 2.50, 1, 1),
    ('1984',                       9780451152458, '1949-06-08', 'Printed', 328, NULL, 2, 2),
    ('Animal Farm',                9780451152441, '1945-08-17', 'EBook',   112, 1.20, 2, 2),
    ('Pride and Prejudice',        9780141395182, '1813-01-28', 'Printed', 432, NULL, 3, 3),
    ('Sense and Sensibility',      9780141399678, '1811-10-30', 'EBook',   409, 3.10, 3, 3),
    ('Emma',                       9780141399463, '1815-12-23', 'Printed', 474, NULL, 3, 4),
    ('To Kill a Mockingbird',      9780061200088, '1960-07-11', 'Printed', 281, NULL, 4, 1),
    ('Go Set a Watchman',          9780062409850, '2015-07-14', 'EBook',   278, 2.80, 4, 1),
    ('The Hobbit',                 9780547428679, '1937-09-21', 'Printed', 310, NULL, 5, 5),
    ('The Fellowship of the Ring', 9780547428686, '1954-07-29', 'Printed', 423, NULL, 5, 5),
    ('The Two Towers',             9780547428693, '1954-11-11', 'EBook',   352, 3.50, 5, 5);

-- Verify database after restore
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Verify row counts
SELECT 'authors' AS table_name, COUNT(*) AS row_count FROM authors
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'books', COUNT(*) FROM books;