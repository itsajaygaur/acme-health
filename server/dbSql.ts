import sql from "mssql";
import "dotenv/config";

const config: sql.config = {

  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT!),
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

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("✅ Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    console.error("❌ SQL Server connection failed:", err);
    throw err;
  });

export default sql;
