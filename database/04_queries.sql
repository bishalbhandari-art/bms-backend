
-- BMS Database — SQL Queries

-- Demonstrates: SELECT, WHERE, ORDER BY,
--               JOIN, UPDATE, DELETE

-- ── SELECT: all books ──
SELECT *
FROM books;
-- ── SELECT: specific columns ──
SELECT title,
    isbn,
    publish_date
FROM books;
-- ── WHERE: filter by condition ──
SELECT title,
    publish_date
FROM books
WHERE publish_date > '1950-01-01';
-- ── WHERE: combine conditions with AND ──
SELECT title,
    publish_date
FROM books
WHERE publish_date > '1900-01-01'
    AND author_id = 2;
-- ── ORDER BY: sort results ──
SELECT title,
    publish_date
FROM books
ORDER BY publish_date DESC;
-- ── INNER JOIN: books with author names ──
SELECT b.title,
    b.publish_date,
    a.name AS author_name
FROM books AS b
    INNER JOIN authors AS a ON b.author_id = a.author_id;
-- ── INNER JOIN: books with author and category ──
SELECT b.title,
    b.isbn,
    b.publish_date,
    a.name AS author_name,
    c.name AS category_name
FROM books AS b
    INNER JOIN authors AS a ON b.author_id = a.author_id
    INNER JOIN categories AS c ON b.category_id = c.category_id
ORDER BY b.title;
-- ── LEFT JOIN: all authors, even those with no books ──
SELECT a.name AS author_name,
    b.title AS book_title
FROM authors AS a
    LEFT JOIN books AS b ON a.author_id = b.author_id
ORDER BY a.name;
-- ── COUNT: books per author ──
SELECT a.name AS author_name,
    COUNT(b.id) AS total_books
FROM authors AS a
    INNER JOIN books AS b ON a.author_id = b.author_id
GROUP BY a.name
ORDER BY total_books DESC;
-- ── COUNT: books per category ──
SELECT c.name AS category_name,
    COUNT(b.id) AS total_books
FROM categories AS c
    INNER JOIN books AS b ON c.category_id = b.category_id
GROUP BY c.name
ORDER BY total_books DESC;
-- ── UPDATE: change an author's email ──
UPDATE authors
SET email = 'george.orwell@literature.com'
WHERE author_id = 2;
-- Verify the update
SELECT *
FROM authors
WHERE author_id = 2;
-- Revert
UPDATE authors
SET email = 'orwell@example.com'
WHERE author_id = 2;
-- ── DELETE: remove a book ──
DELETE FROM books
WHERE id = 14;
-- Verify the delete
SELECT *
FROM books
WHERE id = 9;
-- Restore the deleted book
INSERT INTO books(
        title,
        isbn,
        publish_date,
        book_type,
        page_count,
        file_size,
        author_id,
        category_id
    )
VALUES (
        'Go Set a Watchman',
        '978-0-0624-0986-0',
        '2015-07-14',
        'EBook',
        278,
        '2.8 MB',
        4,
        1
    );
    SELECT * FROM books ;