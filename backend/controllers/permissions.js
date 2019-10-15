import SQL from "sql-template-strings";
import sqlite from "sqlite";



const DBSOURCE = "./db.sqlite";

const test = async () => {
    const db = await sqlite.open(DBSOURCE);
    await db.run(
      `CREATE TABLE IF NOT EXISTS permission (per_id INTEGER PRIMARY KEY AUTOINCREMENT, permission_name text NOT NULL );`
    );
}
export default test;