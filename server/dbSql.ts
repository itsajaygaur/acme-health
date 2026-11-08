import sql from "mssql";
import "dotenv/config";

// Read a setting from the first env var that is set. The code historically used
// DB_*, while EXPORT_README.md documents MSSQL_*; accept both so a deployment
// configured from either source connects.
function env(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && value.trim() !== "") return value.trim();
  }
  return undefined;
}

function envBool(defaultValue: boolean, ...names: string[]): boolean {
  const value = env(...names);
  if (value === undefined) return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function buildConfig(): sql.config {
  const server = env("DB_SERVER", "MSSQL_SERVER", "SQL_SERVER");
  const database = env("DB_NAME", "DB_DATABASE", "MSSQL_DATABASE");
  const user = env("DB_USER", "MSSQL_USER");
  const password = env("DB_PASSWORD", "MSSQL_PASSWORD");
  const portRaw = env("DB_PORT", "MSSQL_PORT");
  const port = portRaw ? parseInt(portRaw, 10) : 1433;

  const missing: string[] = [];
  if (!server) missing.push("DB_SERVER (or MSSQL_SERVER)");
  if (!database) missing.push("DB_NAME (or MSSQL_DATABASE)");
  if (!user) missing.push("DB_USER (or MSSQL_USER)");
  if (!password) missing.push("DB_PASSWORD (or MSSQL_PASSWORD)");
  if (missing.length) {
    throw new Error(
      `SQL Server is not configured. Missing environment variable(s): ${missing.join(", ")}`,
    );
  }
  if (!Number.isInteger(port) || port <= 0 || port >= 65536) {
    throw new Error(`Invalid DB_PORT/MSSQL_PORT value: "${portRaw}"`);
  }

  return {
    user,
    password,
    server: server!,
    database,
    port,
    connectionTimeout: parseInt(env("DB_CONNECTION_TIMEOUT") ?? "", 10) || 15000,
    requestTimeout: parseInt(env("DB_REQUEST_TIMEOUT") ?? "", 10) || 30000,
    options: {
      encrypt: envBool(true, "DB_ENCRYPT", "MSSQL_ENCRYPT"),
      trustServerCertificate: envBool(
        true,
        "DB_TRUST_SERVER_CERTIFICATE",
        "MSSQL_TRUST_SERVER_CERTIFICATE",
      ),
    },
    pool: {
      // Serverless instances handle one request at a time; keep the pool small
      // so many concurrent instances don't exhaust the database's connections.
      max: parseInt(env("DB_POOL_MAX") ?? "", 10) || 5,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

let poolPromiseCache: Promise<sql.ConnectionPool> | null = null;

// Returns a connected pool, connecting lazily on first use. A failed or closed
// connection is not cached: the next call reconnects. This matters on Vercel,
// where a warm function instance otherwise kept a rejected promise forever and
// every later request failed with the same connection error.
export async function getPool(): Promise<sql.ConnectionPool> {
  if (poolPromiseCache) {
    const pool = await poolPromiseCache;
    if (pool.connected) return pool;
    // The connection died (e.g. while the serverless instance was frozen).
    poolPromiseCache = null;
    pool.close().catch(() => {});
  }

  const config = buildConfig();
  const pool = new sql.ConnectionPool(config);
  pool.on("error", (err) => {
    console.error("❌ SQL Server pool error:", err);
    poolPromiseCache = null;
  });

  const target = `${config.server}:${config.port}/${config.database}`;
  poolPromiseCache = pool
    .connect()
    .then((connected) => {
      console.log(`✅ Connected to SQL Server ${target}`);
      return connected;
    })
    .catch((err) => {
      console.error(`❌ SQL Server connection to ${target} failed:`, err);
      poolPromiseCache = null;
      pool.close().catch(() => {});
      throw err;
    });
  return poolPromiseCache;
}

export default sql;
