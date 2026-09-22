-- BMS Database — Insert Sample Data
-- Insert authors
TRUNCATE books, categories, authors RESTART IDENTITY CASCADE;
INSERT INTO authors (name, email)
VALUES ('F. Scott Fitzgerald', 'fitzgerald@example.com'),
    ('George Orwell', 'orwell@example.com'),
    ('Jane Austen', 'austen@example.com'),
    ('Harper Lee', 'lee@example.com'),
    ('J.R.R. Tolkien', 'tolkien@example.com');
-- Insert categories
INSERT INTO categories (name)
VALUES ('Fiction'),
    ('Non-Fiction'),
    ('Science Fiction'),
    ('Mystery'),
    ('Classic');
-- Insert books
INSERT INTO books (
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
        'The Great Gatsby',
        9780743273565,
        '1925-04-10',
        'Printed',
        180,
        NULL,
        1,
        1
    ),
    (
        'Tender Is the Night',
        9780684801546,
        '1934-04-12',
        'EBook',
        315,
        2.50,
        1,
        1
    ),
    (
        '1984',
        9780451152458,
        '1949-06-08',
        'Printed',
        328,
        NULL,
        2,
        2
    ),
    (
        'Animal Farm',
        9780451152441,
        '1945-08-17',
        'EBook',
        112,
        1.20,
        2,
        2
    ),
    (
        'Pride and Prejudice',
        9780141395182,
        '1813-01-28',
        'Printed',
        432,
        NULL,
        3,
        3
    ),
    (
        'Sense and Sensibility',
        9780141399678,
        '1811-10-30',
        'EBook',
        409,
        3.10,
        3,
        3
    ),
    (
        'Emma',
        9780141399463,
        '1815-12-23',
        'Printed',
        474,
        NULL,
        3,
        4
    ),
    (
        'To Kill a Mockingbird',
        9780061200088,
        '1960-07-11',
        'Printed',
        281,
        NULL,
        4,
        1
    ),
    (
        'Go Set a Watchman',
        9780062409850,
        '2015-07-14',
        'EBook',
        278,
        2.80,
        4,
        1
    ),
    (
        'The Hobbit',
        9780547428679,
        '1937-09-21',
        'Printed',
        310,
        NULL,
        5,
        5
    ),
    (
        'The Fellowship of the Ring',
        9780547428686,
        '1954-07-29',
        'Printed',
        423,
        NULL,
        5,
        5
    ),
    (
        'The Two Towers',
        9780547428693,
        '1954-11-11',
        'EBook',
        352,
        3.50,
        5,
        5
    );

    -- To see tables SELECT * FROM categories