import SQL from "sql-template-strings";
import sqlite from "sqlite";

const DBSOURCE = "./db.sqlite";

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

const initializeDatabase = async () => {
  const db = await sqlite.open(DBSOURCE);
  //  await db.migrate({ force: 'last' })
  await db.run(
    `CREATE TABLE IF NOT EXISTS orders (order_id INTEGER PRIMARY KEY AUTOINCREMENT, amount Int, address text, date timestamp, status text);`
  );
  const getOrders = async () => {
    try {
      let stmt = SQL`SELECT * FROM orders`;
      const rows = await db.all(stmt);
      if (rows.length === 0) {
        throw new Error("no orders found!");
      }
      return rows;
    } catch (err) {
      throw new Error("could not retrieve list!");
    }
  };
  const getOrder = async order_id => {
    try {
      let stmt = SQL`SELECT id AS order_id, amount, address, date, status,user_id  FROM orders WHERE order_id = ${order_id}`;
      const rows = await db.all(stmt);
      const order = rows[0];
      if (!order) {
        throw new Error(` order with order_id = ${order_id} doesnt exist`);
      } else return order;
    } catch (err) {
      throw new Error(
        `could not get order with order_id = ${order_id}` + err.message
      );
    }
  };
  const addOrder = async props => {
    const { amount, address, status, user_id } = props;
    if (!props || !(amount || status || address || user_id)) {
      throw new Error("you must provide user_id");
    }
    try {
      const date = nowForSQLite();
      const result = await db.run(
        SQL`INSERT INTO orders (amount, address, status, date, user_id) Values (${amount}, ${status}, ${address},${date},${user_id})`
      );

      return { data: result.lastID };
    } catch (err) {
      console.log("err", err);
      throw new Error("cannot insert this combination of order");
    }
  };
  const updateOrder = async (order_id, props) => {
    const { amount, address, status, user_id } = props;
    if (!props || !(amount || status || address || user_id)) {
      throw new Error("you must provide user_id");
    }
    try {
      const date = nowForSQLite();
      // const previousProps = await getuser(id);
      const newProps = { ...props, date };
      const stmt = SQL`UPDATE orders SET `
        .append(
          joinSQLStatementKeys(
            ["amount", "address", "status", "date", "per_id"],
            newProps,
            ", "
          )
        )
        .append(SQL` WHERE `)
        .append(joinSQLStatementKeys(["order_id"], { order_id }, " AND "));
      const result = await db.run(stmt);
      if (result.stmt.changes === 0) {
        throw new Error(`no changes were made`);
      }
      return true;
    } catch (err) {
      throw new Error(`couldn't update the order ${order_id}:` + err.message);
    }
  };
  const deleteOrder = async order_id => {
    try {
      const result = await db.run(
        SQL`Delete from orders where order_id = ${order_id} `
      );
      if (result.stmt.changes === 0) {
        throw new Error(`could not delete order with order_id = ${order_id}`);
      }
      return true;
    } catch (err) {
      throw new Error("could not delete order");
    }
  };
  const controller = {
    getOrders,
    getOrder,
    addOrder,
    updateOrder,
    deleteOrder
  };
  return controller;
};
export default initializeDatabase;
