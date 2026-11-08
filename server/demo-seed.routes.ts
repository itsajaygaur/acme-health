import { timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Router } from "express";
import sql, { poolPromise } from "./dbSql";
import { log } from "./logger";

const app = Router();
const skippedSeedTables = new Set([
  "_files_loaded",
  "users",
  "UserSearchPreferences",
]);

function splitBatches(script: string) {
  return script
    .split(/^\s*GO\s*;?\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);
}

function removeSkippedSeedTables(script: string) {
  const keptLines: string[] = [];
  let skipTable: string | undefined;

  for (const line of script.split(/\r?\n/)) {
    const identityInsert = line.match(
      /^\s*SET\s+IDENTITY_INSERT\s+\[dbo\]\.\[([^\]]+)\]\s+(ON|OFF)\s*;?\s*$/i,
    );
    if (identityInsert) {
      const [, table, state] = identityInsert;
      if (state.toUpperCase() === "ON") {
        skipTable = skippedSeedTables.has(table) ? table : undefined;
      } else {
        if (skipTable !== table) {
          keptLines.push(line);
        }
        skipTable = undefined;
      }
      continue;
    }

    if (!skipTable) {
      keptLines.push(line);
    }
  }

  if (skipTable) {
    throw new Error(`Unclosed identity insert block for ${skipTable}`);
  }
  return keptLines.join("\n");
}

async function executeBatches(
  transaction: sql.Transaction,
  script: string,
) {
  for (const batch of splitBatches(script)) {
    await transaction.request().batch(batch);
  }
}

app.post("/seed-demo-database", async (req, res) => {
  const expectedToken = process.env.DB_DEMO_SEED_TOKEN;
  const providedToken = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (
    !expectedToken ||
    !providedToken ||
    Buffer.byteLength(expectedToken) !== Buffer.byteLength(providedToken) ||
    !timingSafeEqual(Buffer.from(expectedToken), Buffer.from(providedToken))
  ) {
    return res.sendStatus(404);
  }

  let transaction: sql.Transaction | undefined;
  try {
    const pool = await poolPromise;
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) AS table_count
      FROM sys.tables
      WHERE is_ms_shipped = 0
    `);
    if (tableCheck.recordset[0].table_count !== 0) {
      return res.status(409).json({ message: "Database is not empty" });
    }

    const schemaPath = path.join(__dirname, "client", "20250620-MSSQL-Table-Proc.sql");
    const seedPath = path.join(
      __dirname,
      "client",
      "20250620-MSSQL-Data-Development-Purpose.sql",
    );
    const originalSchema = readFileSync(schemaPath, "utf8");
    const schema = originalSchema.replace(
      /^\s*IF\s+object_id\([^)]*\)\s+is\s+not\s+null\s*\r?\n\s*DROP\s+TABLE\s+\[[^\]]+\]\s*\r?\nGO\s*$/gim,
      "",
    );
    const repairedSchema = schema.replace(
      /\/\*{6} Object:\s+StoredProcedure \[dbo\]\.\[sp_GetTopReviewers\][\s\S]*?\r?\n\*\/(?=\s*\/\*{6} Object:\s+StoredProcedure \[dbo\]\.\[sp_GetUserById\])/i,
      "",
    );
    if (/^\s*DROP\s+TABLE\s+\[(?!#)[^\]]+\]/im.test(repairedSchema)) {
      throw new Error("Refusing to execute a schema script containing table drops");
    }

    const firstProcedure = repairedSchema.search(/CREATE\s+OR\s+ALTER\s+(?:PROC|PROCEDURE)\b/i);
    if (firstProcedure < 0) {
      throw new Error("Schema script does not contain its stored procedures");
    }

    const supplementalSchema = `
ALTER TABLE dbo.jobs ADD reviewer NVARCHAR(255) NULL;
ALTER TABLE dbo.jobs ADD is_active BIT NOT NULL CONSTRAINT DF_demo_jobs_is_active DEFAULT (1);
ALTER TABLE dbo.job_descriptions ADD last_edited_by NVARCHAR(255) NULL;
ALTER TABLE dbo.configuration ADD is_active BIT NOT NULL CONSTRAINT DF_demo_configuration_is_active DEFAULT (0);
DECLARE @preferencesPk SYSNAME;
SELECT @preferencesPk = kc.name
FROM sys.key_constraints kc
WHERE kc.parent_object_id = OBJECT_ID(N'dbo.UserSearchPreferences')
  AND kc.type = 'PK';
IF @preferencesPk IS NOT NULL
BEGIN
  DECLARE @dropPreferencesPkSql NVARCHAR(MAX) =
    N'ALTER TABLE dbo.UserSearchPreferences DROP CONSTRAINT [' +
    REPLACE(@preferencesPk, N']', N']]') + N']';
  EXEC sys.sp_executesql @dropPreferencesPkSql;
END;
ALTER TABLE dbo.UserSearchPreferences ALTER COLUMN UserId INT NULL;
ALTER TABLE dbo.UserSearchPreferences ADD CONSTRAINT PK_demo_UserSearchPreferences PRIMARY KEY (Id);
ALTER TABLE dbo.UserSearchPreferences ADD username NVARCHAR(255) NULL;
ALTER TABLE dbo.notifications ADD username NVARCHAR(255) NULL;
DECLARE @notificationPk SYSNAME;
SELECT @notificationPk = kc.name
FROM sys.key_constraints kc
WHERE kc.parent_object_id = OBJECT_ID(N'dbo.notifications')
  AND kc.type = 'PK';
IF @notificationPk IS NOT NULL
BEGIN
  DECLARE @dropNotificationPkSql NVARCHAR(MAX) =
    N'ALTER TABLE dbo.notifications DROP CONSTRAINT [' +
    REPLACE(@notificationPk, N']', N']]') + N']';
  EXEC sys.sp_executesql @dropNotificationPkSql;
END;
ALTER TABLE dbo.notifications ALTER COLUMN user_id INT NULL;
ALTER TABLE dbo.notifications ADD CONSTRAINT PK_demo_notifications PRIMARY KEY (id);
ALTER TABLE dbo.job_reviewers ADD id INT IDENTITY(1,1) NOT NULL;
ALTER TABLE dbo.job_reviewers ADD reviewer NVARCHAR(255) NULL;
DECLARE @reviewerPk SYSNAME;
SELECT @reviewerPk = kc.name
FROM sys.key_constraints kc
WHERE kc.parent_object_id = OBJECT_ID(N'dbo.job_reviewers')
  AND kc.type = 'PK';
IF @reviewerPk IS NOT NULL
BEGIN
  DECLARE @dropReviewerPkSql NVARCHAR(MAX) =
    N'ALTER TABLE dbo.job_reviewers DROP CONSTRAINT [' +
    REPLACE(@reviewerPk, N']', N']]') + N']';
  EXEC sys.sp_executesql @dropReviewerPkSql;
END;
ALTER TABLE dbo.job_reviewers ALTER COLUMN user_id INT NULL;
ALTER TABLE dbo.job_reviewers ADD CONSTRAINT PK_demo_job_reviewers PRIMARY KEY (id);

CREATE TABLE dbo.essential_functions (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  job_id INT NOT NULL,
  job_description_id INT NULL,
  has_edit BIT NOT NULL CONSTRAINT DF_demo_essential_functions_has_edit DEFAULT (0),
  function_text NVARCHAR(MAX) NOT NULL,
  sort_order INT NOT NULL CONSTRAINT DF_demo_essential_functions_sort DEFAULT (1),
  created_at DATETIME2(7) NOT NULL CONSTRAINT DF_demo_essential_functions_created DEFAULT (SYSUTCDATETIME()),
  updated_at DATETIME2(7) NOT NULL CONSTRAINT DF_demo_essential_functions_updated DEFAULT (SYSUTCDATETIME())
);
CREATE TABLE dbo.comments (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  job_id INT NOT NULL,
  comment NVARCHAR(MAX) NOT NULL,
  category NVARCHAR(100) NULL,
  author NVARCHAR(255) NULL,
  is_critical BIT NULL,
  created_at DATETIME2(7) NOT NULL CONSTRAINT DF_demo_comments_created DEFAULT (SYSUTCDATETIME())
);
CREATE TABLE dbo.audit_log (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  user_id INT NULL,
  action NVARCHAR(100) NOT NULL,
  entity_type NVARCHAR(100) NOT NULL,
  entity_id INT NULL,
  details NVARCHAR(MAX) NULL,
  ip_address NVARCHAR(64) NULL,
  created_at DATETIME2(7) NOT NULL CONSTRAINT DF_demo_audit_created DEFAULT (SYSUTCDATETIME())
);
CREATE TABLE dbo.notification_settings (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  email_notifications BIT NOT NULL CONSTRAINT DF_demo_notification_email DEFAULT (1),
  job_updates BIT NOT NULL CONSTRAINT DF_demo_notification_jobs DEFAULT (1),
  updated_at DATETIME2(7) NOT NULL CONSTRAINT DF_demo_notification_updated DEFAULT (SYSUTCDATETIME())
);
INSERT INTO dbo.notification_settings (email_notifications, job_updates) VALUES (1, 1);
`;

    const seed = removeSkippedSeedTables(readFileSync(seedPath, "utf8"));
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    const insideTransactionCheck = await transaction.request().query(`
      SELECT COUNT(*) AS table_count
      FROM sys.tables
      WHERE is_ms_shipped = 0
    `);
    if (insideTransactionCheck.recordset[0].table_count !== 0) {
      await transaction.rollback();
      return res.status(409).json({ message: "Database is not empty" });
    }

    await executeBatches(transaction, repairedSchema.slice(0, firstProcedure));
    await transaction.request().batch(supplementalSchema);
    await executeBatches(transaction, repairedSchema.slice(firstProcedure));
    await executeBatches(transaction, seed);
    await transaction.request().batch(`
      UPDATE jr
      SET reviewer = p.name
      FROM dbo.job_reviewers jr
      INNER JOIN dbo.people p ON p.id = jr.user_id;

      UPDATE j
      SET reviewer = assigned.reviewer
      FROM dbo.jobs j
      OUTER APPLY (
        SELECT TOP (1) jr.reviewer
        FROM dbo.job_reviewers jr
        WHERE jr.job_id = j.id
        ORDER BY jr.id
      ) assigned;

      UPDATE jd
      SET last_edited_by = COALESCE(p.name, N'Demo User')
      FROM dbo.job_descriptions jd
      LEFT JOIN dbo.people p ON p.id = jd.last_edited_by_id;

      INSERT INTO dbo.essential_functions (job_id, function_text, sort_order)
      SELECT job_id, function_text, sort_order
      FROM dbo.essential_functions_original;
    `);
    await transaction.request().batch(`
      CREATE OR ALTER PROCEDURE dbo.sp_GetNotificationSettings
      AS
      BEGIN
        SET NOCOUNT ON;
        SELECT TOP (1) email_notifications, job_updates
        FROM dbo.notification_settings
        ORDER BY id;
      END;
    `);
    await transaction.request().batch(`
      CREATE OR ALTER PROCEDURE dbo.sp_GetUserNotifications
        @limit INT = 10,
        @page INT = 1,
        @JobType NVARCHAR(100) = NULL,
        @isHRLeader BIT = 0
      AS
      BEGIN
        SET NOCOUNT ON;
        DECLARE @offset INT = (@page - 1) * @limit;

        SELECT n.id, n.title, n.message, n.type, n.status, n.priority,
               n.is_read, n.created_at, jf.job_family AS jobType
        FROM dbo.notifications n
        LEFT JOIN dbo.jobs j ON j.id = n.job_id
        LEFT JOIN dbo.job_families jf ON jf.id = j.job_family_id
        WHERE @JobType IS NULL OR jf.job_family LIKE N'%' + @JobType + N'%'
        ORDER BY n.created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(1) AS TotalCount
        FROM dbo.notifications n
        LEFT JOIN dbo.jobs j ON j.id = n.job_id
        LEFT JOIN dbo.job_families jf ON jf.id = j.job_family_id
        WHERE @JobType IS NULL OR jf.job_family LIKE N'%' + @JobType + N'%';
      END;
    `);

    await transaction.commit();
    return res.json({
      message: "Demo database initialized",
      tables: (await pool.request().query(`
        SELECT COUNT(*) AS count FROM sys.tables WHERE is_ms_shipped = 0
      `)).recordset[0].count,
      jobs: (await pool.request().query(`
        SELECT COUNT(*) AS count FROM dbo.jobs
      `)).recordset[0].count,
      jobFamilies: (await pool.request().query(`
        SELECT COUNT(*) AS count FROM dbo.job_families
      `)).recordset[0].count,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback().catch((rollbackError) => {
        log("Demo database rollback failed:", rollbackError);
      });
    }
    log("Demo database initialization failed:", error);
    return res.status(500).json({ message: "Demo database initialization failed" });
  }
});

export default app;
