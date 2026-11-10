/*
  The JD element a reviewer comment belongs to.

  Comments are shown and written underneath the element they are about
  (Education REQUIRED, Experience REQUIRED, Certification Registration_Licensure
  REQUIRED — the elements a Functional Leader cannot edit directly). There are no
  standalone comments any more: the bottom-of-page comment box is gone.

  section_key matches a key of JobDescriptionSections in
  shared/job-description-fields.ts (e.g. 'educationRequired'), the same
  convention jd_section_changes.section_key follows.

  The column is nullable for the same reason `author` is: rows can arrive from
  outside the app. The app never renders a comment as "unsectioned" — it falls
  back to DEFAULT_COMMENT_SECTION_KEY — because PUT /api/job-description deletes
  the caller's comments that are missing from the save payload, so a comment the
  page does not render is a comment the next save destroys.
*/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF COL_LENGTH('dbo.comments', 'section_key') IS NULL
    ALTER TABLE [dbo].[comments] ADD [section_key] [nvarchar](64) NULL
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_comments_job_section' AND object_id = OBJECT_ID('dbo.comments')
)
    CREATE NONCLUSTERED INDEX [IX_comments_job_section]
        ON [dbo].[comments] ([job_id] ASC, [section_key] ASC, [created_at] DESC)
GO

/*
  Backfill. Before this change the only link between a comment and an element was
  the "<Element Label>: " prefix the per-element button prefilled into the text.
  Tag those rows from the prefix and strip it, since the element is now shown by
  the thread the comment sits in.

  Matching uses LEFT(...) rather than LIKE on purpose: the '_' in
  "Certification Registration_Licensure REQUIRED" is a LIKE wildcard and would
  over-match.

  Anything left over is parked on the first commentable element so it stays
  visible, editable and deletable rather than being stranded.

  Idempotent: every statement is guarded by section_key IS NULL.
*/
DECLARE @labels TABLE (label NVARCHAR(128), section_key NVARCHAR(64));
INSERT INTO @labels (label, section_key) VALUES
    (N'Education REQUIRED',                             N'educationRequired'),
    (N'Experience REQUIRED',                            N'experienceRequired'),
    (N'Certification Registration_Licensure REQUIRED',  N'certificationRequired');

UPDATE c
   SET c.section_key = l.section_key,
       c.comment     = LTRIM(SUBSTRING(c.comment, LEN(l.label) + 2, LEN(c.comment)))
  FROM dbo.comments c
  JOIN @labels l ON LEFT(c.comment, LEN(l.label) + 1) = l.label + N':'
 WHERE c.section_key IS NULL;
GO

UPDATE dbo.comments
   SET section_key = N'educationRequired'
 WHERE section_key IS NULL;
GO
