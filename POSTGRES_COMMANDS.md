# PostgreSQL Commands Reference

A comprehensive guide to PostgreSQL commands for terminal and inside psql.

---

## 🖥️ Terminal Commands (Bash)

### Database Operations
```bash
# Create database
createdb myapp
createdb -U username myapp          # Specify user

# Delete database
dropdb myapp

# Connect to database
psql                                # Connect to default database
psql -d myapp                       # Connect to specific database
psql -U username -d myapp           # Specify user and database
psql -h localhost -p 5432 -d myapp  # Specify host and port

# Backup & Restore
pg_dump myapp > backup.sql          # Backup database
pg_dump -U username myapp > backup.sql
psql myapp < backup.sql             # Restore database

# User management
createuser myuser                   # Create user
createuser -P myuser                # Create user with password prompt
dropuser myuser                     # Delete user
```

### Database Server
```bash
# Start/Stop PostgreSQL (Postgres.app)
# Use the app interface

# Start/Stop PostgreSQL (Homebrew)
brew services start postgresql@14
brew services stop postgresql@14
brew services restart postgresql@14

# Check PostgreSQL version
psql --version
pg_config --version
```

---

## 📊 Inside psql (SQL + Meta-commands)

### psql Meta-Commands (start with `\`)

```sql
-- Navigation & Info
\q                          -- Quit psql
\?                          -- Help on psql commands
\h                          -- Help on SQL commands
\h SELECT                   -- Help on specific SQL command

-- Database operations
\l                          -- List all databases
\c myapp                    -- Connect to database 'myapp'
\c myapp username           -- Connect as specific user
\conninfo                   -- Show current connection info

-- Table operations
\dt                         -- List all tables
\dt+                        -- List tables with size
\d tablename                -- Describe table structure
\d+ tablename               -- Detailed table info
\dn                         -- List schemas
\df                         -- List functions
\dv                         -- List views
\di                         -- List indexes

-- User & permissions
\du                         -- List users/roles
\dp                         -- List table privileges

-- Import/Export
\i file.sql                 -- Execute SQL from file
\o output.txt               -- Send output to file
\o                          -- Stop sending output to file

-- Display settings
\x                          -- Toggle expanded display (better for wide tables)
\timing                     -- Show query execution time
```

### SQL Commands (Standard SQL)

```sql
-- DATABASE
CREATE DATABASE myapp;
DROP DATABASE myapp;
ALTER DATABASE myapp RENAME TO newname;

-- TABLES
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

DROP TABLE users;
DROP TABLE IF EXISTS users;

ALTER TABLE users ADD COLUMN age INTEGER;
ALTER TABLE users DROP COLUMN age;
ALTER TABLE users RENAME COLUMN name TO full_name;

-- INDEXES
CREATE INDEX idx_email ON users(email);
DROP INDEX idx_email;

-- VIEWING DATA
SELECT * FROM users;
SELECT * FROM users LIMIT 10;
SELECT name, email FROM users WHERE id = 1;
SELECT * FROM users ORDER BY created_at DESC;
SELECT COUNT(*) FROM users;

-- INSERTING DATA
INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com');

-- UPDATING DATA
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;
UPDATE users SET email = 'default@example.com' WHERE email IS NULL;

-- DELETING DATA
DELETE FROM users WHERE id = 1;
DELETE FROM users WHERE created_at < NOW() - INTERVAL '1 year';
TRUNCATE TABLE users;                    -- Delete all rows (faster than DELETE)

-- USERS & PERMISSIONS
CREATE USER myuser WITH PASSWORD 'mypassword';
ALTER USER myuser WITH PASSWORD 'newpassword';
DROP USER myuser;

GRANT ALL PRIVILEGES ON DATABASE myapp TO myuser;
GRANT SELECT, INSERT ON users TO myuser;
REVOKE ALL PRIVILEGES ON DATABASE myapp FROM myuser;

-- TRANSACTIONS
BEGIN;                                   -- Start transaction
COMMIT;                                  -- Save changes
ROLLBACK;                                -- Undo changes

-- Example transaction
BEGIN;
INSERT INTO users (name, email) VALUES ('Test', 'test@example.com');
DELETE FROM users WHERE id = 999;
COMMIT;                                  -- Both operations succeed or fail together
```

---

## 🎯 Common Workflows

### Setup New Project Database
```bash
# Terminal
createdb todo_next
psql -d todo_next
```

```sql
-- Inside psql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

\dt                                      -- Verify table created
INSERT INTO todos (title) VALUES ('Learn PostgreSQL');
SELECT * FROM todos;
```

### Check Database Size
```sql
-- Inside psql
\l+                                      -- List databases with sizes
SELECT pg_size_pretty(pg_database_size('todo_next'));
```

### Debugging Queries
```sql
-- Inside psql
\timing                                  -- Turn on timing
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
EXPLAIN ANALYZE SELECT * FROM users;     -- Show actual execution
```

### Export Query Results
```sql
-- Inside psql
\o /tmp/users.txt
SELECT * FROM users;
\o                                       -- Stop output to file
```

---

## 💡 Pro Tips

```sql
-- Pretty print in terminal
\x                                       -- Toggle expanded display

-- Edit query in your $EDITOR
\e                                       -- Opens last query in editor

-- Execute previous command
\g                                       -- Re-run last query

-- Clear screen
\! clear                                 -- On Mac/Linux
```

---

## Quick Reference

### When to use what:

**Terminal commands** (when NOT in psql):
- Creating/dropping databases: `createdb`, `dropdb`
- Connecting to PostgreSQL: `psql -d dbname`
- Backup/restore: `pg_dump`, `psql < backup.sql`

**Inside psql** (after `=#` prompt):
- SQL queries: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- Meta-commands: `\l`, `\dt`, `\d tablename`, `\q`
- Creating tables, users, grants

### Remember:
- SQL commands end with `;`
- psql meta-commands start with `\` and don't need `;`
- Use `\q` to exit psql
- Use `Ctrl+C` to cancel a query
- Use `Ctrl+D` to exit psql (alternative to `\q`)
