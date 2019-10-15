import SQL from "sql-template-strings";
import sqlite from "sqlite";

const nowForSQLite = () =>
  new Date()
    .toISOString()
    .replace("T", " ")
    .replace("Z", "");

const joinSQLStatementKeys = (
  keys,
  values,
  delimiter,
  keyValueSeparator = "="
) => {
  return keys
    .map(propName => {
      const value = values[propName];
      if (value !== null && typeof value !== "undefined") {
        return SQL``
          .append(propName)
          .append(keyValueSeparator)
          .append(SQL`${value}`);
      }
      return false;
    })
    .filter(Boolean)
    .reduce((prev, curr) => prev.append(delimiter).append(curr));
};
const DBSOURCE = "./db.sqlite";
const initializeDatabase = async () => {
  const db = await sqlite.open(DBSOURCE);
  //  await db.migrate({ force: 'last' })
  await db.run(
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name text NOT NULL, email text NOT NULL UNIQUE, password text NOT NULL, resetToken text, resetTokenExpiry float,created_at timestamp, updated_at timestamp, deleted_at timestamp );`
  );
  const getUsers = async () => {
    try {
      let stmt = SQL`SELECT * FROM users`;
      const rows = await db.all(stmt);
      if (rows.length === 0) {
        throw new Error("no users found!");
      }
      return rows;
    } catch (err) {
      throw new Error("could not retrieve list!");
    }
  };
  const getuser = async id => {
    try {
      let stmt = SQL`SELECT id AS id, name, email, password,per_id  FROM users WHERE id = ${id}`;
      const rows = await db.all(stmt);
      const user = rows[0];
      if (!user) {
        throw new Error(` user with id = ${id} doesnt exist`);
      } else return user;
    } catch (err) {
      throw new Error(`could not get user with id = ${id}` + err.message);
    }
  };
  const getuserByUsername = async props => {
    try {
      let stmt = SQL`SELECT id AS id, name, email, password,per_id  FROM users WHERE email = ${props.email} and password= ${props.password}`;
      const rows = await db.all(stmt);
      const user = rows[0];
      if (!user) {
        throw new Error(` user with id = ${id} doesnt exist`);
      } else return user;
    } catch (err) {
      throw new Error(`could not get user  + err.message`);
    }
  };
  const addUser = async props => {
    const { name, email, password, per_id } = props;
    if (!props || !(name || email || password || per_id)) {
      throw new Error("you must provide a name and email and password");
    }
    try {
      const created_at = nowForSQLite();
      const result = await db.run(
        SQL`INSERT INTO users (name, email, password, created_at,per_id) Values (${name}, ${email}, ${password},${created_at},${per_id})`
      );

      return { data: result.lastID };
    } catch (err) {
      console.log("err", err);
      throw new Error("cannot insert this combination of name and email");
    }
  };
  const updateUser = async (id, props) => {
    const { name, email, password, per_id } = props;
    if (!props || !(name || email || password || per_id)) {
      throw new Error(`you must provide a name, or email, or passowrd`);
    }
    try {
      const updated_at = nowForSQLite();
      // const previousProps = await getuser(id);
      const newProps = { ...props, updated_at };
      const stmt = SQL`UPDATE users SET `
        .append(
          joinSQLStatementKeys(
            ["name", "email", "passwword", "updated_at", "per_id"],
            newProps,
            ", "
          )
        )
        .append(SQL` WHERE `)
        .append(joinSQLStatementKeys(["id"], { id }, " AND "));
      const result = await db.run(stmt);
      if (result.stmt.changes === 0) {
        throw new Error(`no changes were made`);
      }
      return true;
    } catch (err) {
      throw new Error(`couldn't update the contact ${id}:` + err.message);
    }
  };
  const deleteUser = async id => {
    try {
      const result = await db.run(SQL`Delete from users where id = ${id} `);
      if (result.stmt.changes === 0) {
        throw new Error(`could not delete user with id = ${id}`);
      }
      return true;
    } catch (err) {
      throw new Error("could not delete order");
    }
  };

  const controller = {
    getUsers,
    getuser,
    addUser,
    updateUser,
    deleteUser,
    getuserByUsername
  };
  return controller;
};
export default initializeDatabase;
