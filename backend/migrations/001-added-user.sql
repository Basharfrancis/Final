--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permission (
    per_id INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_name text NOT NULL
);

ALTER TABLE
    permission RENAME TO old_permission;
ALTER TABLE users RENAME TO old_users;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    resetToken text,
    resetTokenExpiry float,
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp,
    per_id INTEGER,
    FOREIGN KEY(per_id) REFERENCES permission(per_id)
);
insert into users(id, name, email, password, resetToken, resetTokenExpiry, created_at, updated_at, deleted_at, per_id) SELECT id, name, email, password, resetToken, resetTokenExpiry, created_at, updated_at, deleted_at, 1 from old_users;
-- copy old data in new table
-- all previous contacts are for the first user

-- remove previous table
DROP TABLE old_users;


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DROP TABLE permission;

Alter table users RENAME to old_users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    resetToken text,
    resetTokenExpiry float,
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp
);

insert into users(id, name, email, password, resetToken, resetTokenExpiry, created_at, updated_at, deleted_at) SELECT id, name, email, password, resetToken, resetTokenExpiry, created_at, updated_at, deleted_at from old_users;



DROP TABLE old_users;