# 📚 Book Management System — PostgreSQL

A normalized PostgreSQL database for managing books, authors, and categories. Demonstrates SQL fundamentals, database design, normalization (3NF), and GitHub-based backup strategy.

---

### Relationships

- **Author 1 ───< Many Books** — One author can write many books
- **Category 1 ───< Many Books** — One category can contain many books

---

## Project Structure

```
bms-postgresql/
│
├── database/
│   ├── 01_create_database.sql
│   ├── 02_create_tables.sql
│   ├── 03_insert_data.sql
│   ├── 04_queries.sql
│   └── backups/
│       └── bms_backup.sql
│
├── README.md
└── .gitignore
```

---

## Setup & Usage

### Prerequisites

- [PostgreSQL](https://www.postgresql.org/download/) installed and running
- [VS Code](https://code.visualstudio.com/) with [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools)
- [Git](https://git-scm.com/)

### Run the Scripts in Order

| # | Script | Purpose |
|---|---|---|
| 1 | `01_create_database.sql` | Creates `bms_database` |
| 2 | `02_create_tables.sql` | Creates `authors`, `categories`, `books` tables |
| 3 | `03_insert_data.sql` | Inserts sample data |
| 4 | `04_queries.sql` | SELECT, WHERE, JOIN, UPDATE, DELETE demos |

---

## SQL Concepts Covered

| Concept | Demonstrated In |
|---|---|
| CREATE TABLE, Primary Key, Foreign Key, Constraints | `02_create_tables.sql` |
| INSERT | `03_insert_data.sql` |
| SELECT, WHERE, ORDER BY, JOIN | `04_queries.sql` |
| UPDATE, DELETE | `04_queries.sql` |

---

## Normalization (3NF)

| Normal Form | Requirement | Status |
|---|---|---|
| **1NF** | All columns contain atomic values | ✅ |
| **2NF** | No partial dependencies | ✅ |
| **3NF** | No transitive dependencies | ✅ |

---

## Backup Strategy

### pg_dump

```bash
# Create backup
pg_dump -U postgres -d bms_database -F p -f database/backups/bms_backup.sql

# Restore from backup
psql -U postgres -d bms_database -f database/backups/bms_backup.sql
```

### GitHub

All SQL scripts are version-controlled with Git and pushed to GitHub for remote backup.

---

## Technologies

- PostgreSQL
- SQL
- VS Code + SQLTools
- Git & GitHub