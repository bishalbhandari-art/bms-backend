-- BMS Database — Insert Sample Data
-- Insert authors
INSERT INTO authors (name, email)
VALUES ('F. Scott Fitzgerald', 'fitzgerald@example.com'),
    ('George Orwell', 'orwell@example.com'),
    ('Jane Austen', 'austen@example.com'),
    ('Harper Lee', 'lee@example.com'),
    ('J.R.R. Tolkien', 'tolkien@example.com');
-- Insert categories
INSERT INTO categories (name)
VALUES ('Fiction'),
    ('Dystopian'),
    ('Romance'),
    ('Classic'),
    ('Fantasy');
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
        '978-0-7432-7356-5',
        '1925-04-10',
        'Printed',
        180,
        NULL,
        1,
        1
    ),
    (
        'Tender Is the Night',
        '978-0-6848-0154-6',
        '1934-04-12',
        'EBook',
        315,
        '2.5 MB',
        1,
        1
    ),
    (
        '1984',
        '978-0-4511-5245-8',
        '1949-06-08',
        'Printed',
        328,
        NULL,
        2,
        2
    ),
    (
        'Animal Farm',
        '978-0-4511-5244-1',
        '1945-08-17',
        'EBook',
        112,
        '1.2 MB',
        2,
        2
    ),
    (
        'Pride and Prejudice',
        '978-0-1413-9518-2',
        '1813-01-28',
        'Printed',
        432,
        NULL,
        3,
        3
    ),
    (
        'Sense and Sensibility',
        '978-0-1413-9967-8',
        '1811-10-30',
        'EBook',
        409,
        '3.1 MB',
        3,
        3
    ),
    (
        'Emma',
        '978-0-1413-9946-3',
        '1815-12-23',
        'Printed',
        474,
        NULL,
        3,
        4
    ),
    (
        'To Kill a Mockingbird',
        '978-0-0612-0008-8',
        '1960-07-11',
        'Printed',
        281,
        NULL,
        4,
        1
    ),
    (
        'Go Set a Watchman',
        '978-0-0624-0985-0',
        '2015-07-14',
        'EBook',
        278,
        '2.8 MB',
        4,
        1
    ),
    (
        'The Hobbit',
        '978-0-5474-2867-9',
        '1937-09-21',
        'Printed',
        310,
        NULL,
        5,
        5
    ),
    (
        'The Fellowship of the Ring',
        '978-0-5474-2868-6',
        '1954-07-29',
        'Printed',
        423,
        NULL,
        5,
        5
    ),
    (
        'The Two Towers',
        '978-0-5474-2869-3',
        '1954-11-11',
        'EBook',
        352,
        '3.5 MB',
        5,
        5
    );

    -- To see tables SELECT * FROM categories