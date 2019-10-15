--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
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

ALTER TABLE orders RENAME TO old_orders;
CREATE TABLE IF NOT EXISTS orders (
   order_id INTEGER PRIMARY KEY AUTOINCREMENT,
   amount Int,
   address text,
   date timestamp,
   status text,
   user_id INTEGER,
   FOREIGN KEY (user_id) REFERENCES users(id)
);
insert into orders(order_id, amount, address, date, status, user_id) SELECT order_id, amount, address, date, status, 1 from old_orders;
-- copy old data in new table
-- all previous contacts are for the first user

-- remove previous table
DROP TABLE old_orders;


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

