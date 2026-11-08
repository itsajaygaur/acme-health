param(
  [string]$ConnectionString
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

if (-not $ConnectionString) {
  $secureConnectionString = Read-Host 'Enter the SQL Server connection string' -AsSecureString
  $connectionStringPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureConnectionString)
  try {
    $ConnectionString = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($connectionStringPointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($connectionStringPointer)
  }
}

# This script is pinned to the reviewed bootstrap commit so the downloaded SQL
# inputs cannot silently change when the repository's branches advance.
$rawBase = 'https://raw.githubusercontent.com/itsajaygaur/acme-health/4086c6f945c22b644fa69e1dafaf13de02c7ca6b/client'
$schemaUrl = "$rawBase/20250620-MSSQL-Table-Proc.sql"
$seedUrl = "$rawBase/20250620-MSSQL-Data-Development-Purpose.sql"
$skippedSeedTables = @('_files_loaded', 'users', 'UserSearchPreferences')

function Get-SqlBatches([string]$Script) {
  return @($Script -split '(?im)^\s*GO\s*;?\s*$' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}

function Invoke-SqlBatches($Connection, $Transaction, [string]$Script) {
  foreach ($batch in (Get-SqlBatches $Script)) {
    $command = $Connection.CreateCommand()
    $command.Transaction = $Transaction
    $command.CommandTimeout = 0
    $command.CommandText = $batch
    [void]$command.ExecuteNonQuery()
    $command.Dispose()
  }
}

function Remove-SkippedSeedTables([string]$Script, [string[]]$SkippedTables) {
  $kept = [System.Collections.Generic.List[string]]::new()
  $skipTable = $null

  foreach ($line in ($Script -split "`r?`n")) {
    $identityInsert = [regex]::Match($line, '^\s*SET\s+IDENTITY_INSERT\s+\[dbo\]\.\[([^\]]+)\]\s+(ON|OFF)\s*;?\s*$', 'IgnoreCase')
    if ($identityInsert.Success) {
      $table = $identityInsert.Groups[1].Value
      $state = $identityInsert.Groups[2].Value.ToUpperInvariant()
      if ($state -eq 'ON') {
        if ($SkippedTables -contains $table) { $skipTable = $table } else { $skipTable = $null }
      } else {
        if ($skipTable -ne $table) { $kept.Add($line) }
        $skipTable = $null
      }
      continue
    }

    if (-not $skipTable) { $kept.Add($line) }
  }

  if ($skipTable) { throw "Seed file has an unclosed IDENTITY_INSERT block for $skipTable" }
  return ($kept -join "`n")
}

$schema = (Invoke-WebRequest -Uri $schemaUrl -UseBasicParsing).Content
$seed = (Invoke-WebRequest -Uri $seedUrl -UseBasicParsing).Content

# The source schema contains DROP TABLE statements. Remove only the guarded
# IF-object-exists/DROP blocks and refuse any remaining table drops.
$schema = [regex]::Replace(
  $schema,
  '(?im)^\s*IF\s+object_id\([^)]*\)\s+is\s+not\s+null\s*\r?\n\s*DROP\s+TABLE\s+\[[^\]]+\]\s*\r?\nGO\s*$\r?\n?',
  ''
)
if ([regex]::IsMatch($schema, '(?im)^\s*DROP\s+TABLE\s+\[(?!#)[^\]]+\]')) {
  throw 'Refusing to continue: the source schema still contains a DROP TABLE statement.'
}

$procedureMatch = [regex]::Match($schema, '(?i)CREATE\s+OR\s+ALTER\s+(?:PROC|PROCEDURE)\b')
if (-not $procedureMatch.Success) { throw 'Could not locate stored procedures in the source schema.' }
$schemaTables = $schema.Substring(0, $procedureMatch.Index)
$schemaProcedures = $schema.Substring($procedureMatch.Index)
$seed = Remove-SkippedSeedTables $seed $skippedSeedTables

$supplementalSchema = @'
ALTER TABLE dbo.jobs ADD reviewer NVARCHAR(255) NULL;
ALTER TABLE dbo.jobs ADD is_active BIT NOT NULL CONSTRAINT DF_demo_jobs_is_active DEFAULT (1);
ALTER TABLE dbo.job_descriptions ADD last_edited_by NVARCHAR(255) NULL;
ALTER TABLE dbo.configuration ADD is_active BIT NOT NULL CONSTRAINT DF_demo_configuration_is_active DEFAULT (0);
DECLARE @preferencesPk SYSNAME;
SELECT @preferencesPk = kc.name FROM sys.key_constraints kc WHERE kc.parent_object_id = OBJECT_ID(N'dbo.UserSearchPreferences') AND kc.type = 'PK';
IF @preferencesPk IS NOT NULL EXEC(N'ALTER TABLE dbo.UserSearchPreferences DROP CONSTRAINT ' + QUOTENAME(@preferencesPk));
ALTER TABLE dbo.UserSearchPreferences ALTER COLUMN UserId INT NULL;
ALTER TABLE dbo.UserSearchPreferences ADD CONSTRAINT PK_demo_UserSearchPreferences PRIMARY KEY (Id);
ALTER TABLE dbo.UserSearchPreferences ADD username NVARCHAR(255) NULL;
ALTER TABLE dbo.notifications ADD username NVARCHAR(255) NULL;
DECLARE @notificationPk SYSNAME;
SELECT @notificationPk = kc.name FROM sys.key_constraints kc WHERE kc.parent_object_id = OBJECT_ID(N'dbo.notifications') AND kc.type = 'PK';
IF @notificationPk IS NOT NULL EXEC(N'ALTER TABLE dbo.notifications DROP CONSTRAINT ' + QUOTENAME(@notificationPk));
ALTER TABLE dbo.notifications ALTER COLUMN user_id INT NULL;
ALTER TABLE dbo.notifications ADD CONSTRAINT PK_demo_notifications PRIMARY KEY (id);
ALTER TABLE dbo.job_reviewers ADD id INT IDENTITY(1,1) NOT NULL;
ALTER TABLE dbo.job_reviewers ADD reviewer NVARCHAR(255) NULL;
DECLARE @reviewerPk SYSNAME;
SELECT @reviewerPk = kc.name FROM sys.key_constraints kc WHERE kc.parent_object_id = OBJECT_ID(N'dbo.job_reviewers') AND kc.type = 'PK';
IF @reviewerPk IS NOT NULL EXEC(N'ALTER TABLE dbo.job_reviewers DROP CONSTRAINT ' + QUOTENAME(@reviewerPk));
ALTER TABLE dbo.job_reviewers ALTER COLUMN user_id INT NULL;
ALTER TABLE dbo.job_reviewers ADD CONSTRAINT PK_demo_job_reviewers PRIMARY KEY (id);

CREATE TABLE dbo.essential_functions (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  job_id INT NOT NULL,
  job_description_id INT NULL,
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
'@

$postSeed = @'
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
'@

$notificationSettingsProcedure = @'
CREATE OR ALTER PROCEDURE dbo.sp_GetNotificationSettings
AS
BEGIN
  SET NOCOUNT ON;
  SELECT TOP (1) email_notifications, job_updates
  FROM dbo.notification_settings
  ORDER BY id;
END;
'@

$userNotificationsProcedure = @'
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
'@

$connection = [System.Data.SqlClient.SqlConnection]::new($ConnectionString)
$transaction = $null
try {
  $connection.Open()
  $transaction = $connection.BeginTransaction([System.Data.IsolationLevel]::Serializable)

  $check = $connection.CreateCommand()
  $check.Transaction = $transaction
  $check.CommandText = 'SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0;'
  $tableCount = [int]$check.ExecuteScalar()
  $check.Dispose()
  if ($tableCount -ne 0) {
    throw "Database is not empty ($tableCount user tables found); no changes were applied."
  }

  Invoke-SqlBatches $connection $transaction $schemaTables
  Invoke-SqlBatches $connection $transaction $supplementalSchema
  Invoke-SqlBatches $connection $transaction $schemaProcedures
  Invoke-SqlBatches $connection $transaction $seed
  Invoke-SqlBatches $connection $transaction $postSeed
  Invoke-SqlBatches $connection $transaction $notificationSettingsProcedure
  Invoke-SqlBatches $connection $transaction $userNotificationsProcedure

  $transaction.Commit()
  $transaction.Dispose()
  $transaction = $null

  $summary = $connection.CreateCommand()
  $summary.CommandText = @'
SELECT
  (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) AS tables,
  (SELECT COUNT(*) FROM dbo.jobs) AS jobs,
  (SELECT COUNT(*) FROM dbo.job_families) AS job_families;
'@
  $reader = $summary.ExecuteReader()
  if ($reader.Read()) {
    Write-Output ("Initialized successfully: {0} tables, {1} jobs, {2} job families." -f $reader['tables'], $reader['jobs'], $reader['job_families'])
  }
  $reader.Dispose()
  $summary.Dispose()
} catch {
  if ($transaction) {
    try { $transaction.Rollback() } catch { }
    $transaction.Dispose()
  }
  throw
} finally {
  if ($connection.State -ne [System.Data.ConnectionState]::Closed) { $connection.Close() }
  $connection.Dispose()
}
