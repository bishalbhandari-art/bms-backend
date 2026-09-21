
-- BMS Database — SQL Queries

-- Demonstrates: SELECT, WHERE, ORDER BY,
--               JOIN, UPDATE, DELETE

-- ── SELECT: all books ──
SELECT *
FROM books;
SELECT *
FROM authors ORDER BY author_id;
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
---- 1. Start the transaction block
BEGIN;
-- ── UPDATE: change an author's email ──
UPDATE authors
SET email = 'george.orwell@literature.com'
WHERE author_id = 2
RETURNING *;
-- ── DELETE: remove a book ── & using returning is refer to the which row has been deleted 
DELETE FROM books
WHERE id = 9
RETURNING *;

-- ROLLBACK; ── will use this when we have to revert the transaction of the query
COMMIT;
 --   SELECT * FROM books ;