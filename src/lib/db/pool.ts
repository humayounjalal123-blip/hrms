import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from "mysql2/promise";

let pool: Pool | null = null;

function readConfig(): PoolOptions {
  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "hrms",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    timezone: "Z",
  };
}

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(readConfig());
  }
  return pool;
}

export async function queryRows<T extends RowDataPacket[]>(
  sql: string,
  params?: Record<string, unknown> | unknown[]
): Promise<T> {
  const [rows] = await getPool().query<T>(sql, params);
  return rows;
}

export async function exec(
  sql: string,
  params?: Record<string, unknown> | unknown[]
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}

export type { RowDataPacket, ResultSetHeader };
