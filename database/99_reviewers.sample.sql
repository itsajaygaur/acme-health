/* =========================================================================
   Acme Health — reviewer bootstrap (OPTIONAL, EDIT BEFORE RUNNING)
   =========================================================================
   The source workbook carries no review state, so job_reviewers starts empty.
   That is a problem in one specific way:

       PUT /api/job-description validates every reviewer in the payload against
       SELECT DISTINCT reviewer FROM job_reviewers, and rejects the save with
       "Please provide valid reviewers!" if a name is not already in there.

   So until this table has at least one row, no functional leader can be
   assigned through the UI, and the dashboard's Reviewers grid stays empty.

   Fill in the names below with real Active Directory display names — the
   "givenName sn" pair the login flow puts in the JWT, e.g. 'Jane Smith' — and
   run this file. Getting a name wrong is harmless: it just shows up as an
   assignable reviewer nobody matches.

   This file is deliberately NOT run by the numbered sequence. Nothing here is
   required for the app to start.
   ========================================================================= */

SET NOCOUNT ON;
GO

/* ------------------------------------------------------------------------
   1. Replace these with your real reviewer names.
   ------------------------------------------------------------------------ */
DECLARE @reviewers TABLE (reviewer NVARCHAR(255) PRIMARY KEY);

INSERT INTO @reviewers (reviewer) VALUES
    (N'REPLACE ME 1'),
    (N'REPLACE ME 2');

IF EXISTS (SELECT 1 FROM @reviewers WHERE reviewer LIKE 'REPLACE ME%')
BEGIN
    RAISERROR('Edit database/99_reviewers.sample.sql and put real reviewer names in before running it.', 16, 1);
    RETURN;
END

/* ------------------------------------------------------------------------
   2. Assign every reviewer to every job in the Total Rewards family.
      Narrow the WHERE clause if you want a more targeted assignment.
   ------------------------------------------------------------------------ */
INSERT INTO dbo.job_reviewers (job_id, reviewer)
SELECT j.id, r.reviewer
FROM dbo.jobs j
CROSS JOIN @reviewers r
WHERE j.is_active = 1
  AND NOT EXISTS (
        SELECT 1 FROM dbo.job_reviewers existing
        WHERE existing.job_id = j.id AND existing.reviewer = r.reviewer
      );

PRINT CONCAT('job_reviewers rows added: ', @@ROWCOUNT);
GO
