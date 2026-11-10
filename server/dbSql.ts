import sql from "mssql";
import "dotenv/config";
import { log } from "./logger";

const DEFAULT_PORT = 1433;

// Credentials pasted into a hosting dashboard (Vercel, etc.) often arrive with
// a stray space or trailing newline. SQL Server treats those characters as part
// of the credential and answers with `ELOGIN: Login failed for user ...`, so
// trim every value before it reaches tedious.
function env(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function buildConfig(): sql.config {
  const required = ["DB_USER", "DB_PASSWORD", "DB_SERVER", "DB_NAME"] as const;
  const missing = required.filter((name) => !env(name));
  if (missing.length > 0) {
    // Without this an unset password is sent as an empty one, and the server
    // answers with a plain "Login failed" that hides the real problem.
    throw new Error(
      `Missing database environment variable(s): ${missing.join(", ")}`
    );
  }

  const rawPort = env("DB_PORT");
  const port = rawPort ? Number.parseInt(rawPort, 10) : DEFAULT_PORT;
  if (Number.isNaN(port)) {
    throw new Error(`DB_PORT is not a number: "${rawPort}"`);
  }

  return {
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
    server: env("DB_SERVER")!,
    database: env("DB_NAME"),
    port,
    options: {
      trustServerCertificate: true,
      encrypt: true, // Set to true for Azure
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

let pending: Promise<sql.ConnectionPool> | null = null;

/**
 * Returns the shared connection pool, creating it on first use.
 *
 * The pool is only cached while it is healthy: a failed connect or a pool-level
 * error drops the cached promise so the next request retries. Caching a
 * rejected promise (as a module-level `connect()` does) poisons the whole
 * serverless instance — every later request replays the first failure even
 * after the underlying problem is gone.
 */
export function getPool(): Promise<sql.ConnectionPool> {
  if (pending) return pending;

  const forget = () => {
    if (pending === attempt) pending = null;
  };

  const attempt: Promise<sql.ConnectionPool> = (async () => {
    const pool = new sql.ConnectionPool(buildConfig());
    pool.on("error", (err) => {
      log("❌ SQL Server pool error:", err);
      forget();
      pool.close().catch(() => {});
    });
    await pool.connect();
    log("✅ Connected to SQL Server");
    return pool;
  })().catch((err) => {
    forget();
    log("❌ SQL Server connection failed:", err);
    throw err;
  });

  pending = attempt;
  return attempt;
}

export default sql;
