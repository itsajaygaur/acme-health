/* =========================================================================
   Acme Health — table definitions
   =========================================================================
   Run order:  01_tables.sql -> 02_procedures.sql -> 03_seed_data.sql
               (then optionally 99_reviewers.sample.sql)

   Every object matches what the Express routes already query. Column names are
   snake_case because the API layer (server/helper.ts convertKeysToCamelCase)
   turns them into the camelCase keys the React client expects.

   Note for editors: SQL Server nests block comments, so a literal slash-star
   sequence inside one of these headers silently swallows the rest of the file.
   Do not write glob paths like server/[star].ts in a comment.

   Re-runnable: each CREATE is guarded, so running this twice is a no-op.
   ========================================================================= */

SET NOCOUNT ON;
GO

/* -------------------------------------------------------------------------
   job_families
   Joined from jobs.job_family_id in nearly every read path.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.job_families', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.job_families
    (
        id          INT             IDENTITY(1,1) NOT NULL,
        job_family  NVARCHAR(150)   NOT NULL,
        description NVARCHAR(500)   NULL,
        is_active   BIT             NOT NULL CONSTRAINT DF_job_families_is_active DEFAULT (1),
        created_at  DATETIME2(0)    NOT NULL CONSTRAINT DF_job_families_created_at DEFAULT (SYSDATETIME()),
        updated_at  DATETIME2(0)    NOT NULL CONSTRAINT DF_job_families_updated_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_job_families PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_job_families_job_family UNIQUE (job_family)
    );
END
GO

/* -------------------------------------------------------------------------
   jobs
   One row per go-forward job code. `reviewer` holds the name of whoever last
   saved the job description (server/routes.ts: UPDATE jobs SET reviewer = ...);
   the full set of assigned functional leaders lives in job_reviewers.

   The extra descriptive columns (job_function, career_*) are not read by the
   app today. They carry the corresponding spreadsheet columns so the seed is
   lossless and the data is there when the UI wants it.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.jobs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.jobs
    (
        id                 INT            IDENTITY(1,1) NOT NULL,
        job_code           NVARCHAR(50)   NOT NULL,
        job_title          NVARCHAR(255)  NOT NULL,
        job_family_id      INT            NULL,
        job_function       NVARCHAR(150)  NULL,
        career_stage       NVARCHAR(100)  NULL,
        career_level_name  NVARCHAR(100)  NULL,
        career_level       NVARCHAR(20)   NULL,
        status             NVARCHAR(50)   NOT NULL CONSTRAINT DF_jobs_status DEFAULT ('Not Started'),
        reviewer           NVARCHAR(255)  NULL,
        is_active          BIT            NOT NULL CONSTRAINT DF_jobs_is_active DEFAULT (1),
        last_updated       DATETIME2(0)   NOT NULL CONSTRAINT DF_jobs_last_updated DEFAULT (SYSDATETIME()),
        created_at         DATETIME2(0)   NOT NULL CONSTRAINT DF_jobs_created_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_jobs PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_jobs_job_code UNIQUE (job_code),
        CONSTRAINT FK_jobs_job_family FOREIGN KEY (job_family_id)
            REFERENCES dbo.job_families (id),
        /* The five values client/src/pages/jobs-family.tsx filters on, plus the
           'Changes Complete' notification status is NOT a job status. */
        CONSTRAINT CK_jobs_status CHECK (status IN
            ('Not Started', 'In Progress', 'Completed', 'Submitted to HR', 'Accepted As Is'))
    );

    CREATE INDEX IX_jobs_job_family_id ON dbo.jobs (job_family_id);
    CREATE INDEX IX_jobs_status        ON dbo.jobs (status);
END
GO

/* -------------------------------------------------------------------------
   job_code_mappings
   The source spreadsheet lists each job once per legacy region (Gundersen /
   Bellin) with its own legacy job code and pre-merger title. The app keys off
   the single go-forward code, so the per-region rows are preserved here rather
   than dropped.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.job_code_mappings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.job_code_mappings
    (
        id                INT            IDENTITY(1,1) NOT NULL,
        job_id            INT            NOT NULL,
        region            NVARCHAR(100)  NOT NULL,
        legacy_job_code   NVARCHAR(50)   NOT NULL,
        current_job_title NVARCHAR(255)  NULL,
        CONSTRAINT PK_job_code_mappings PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_job_code_mappings UNIQUE (region, legacy_job_code),
        CONSTRAINT FK_job_code_mappings_job FOREIGN KEY (job_id)
            REFERENCES dbo.jobs (id) ON DELETE CASCADE
    );
END
GO

/* -------------------------------------------------------------------------
   job_descriptions
   One row per job.

   !! id is deliberately NOT an IDENTITY and is always equal to job_id. !!
   server/routes.ts updates this table with
       UPDATE job_descriptions SET ... WHERE id = @jobId
   while every read joins on job_id. Keeping the two equal is what makes both
   statements address the same row. The CHECK constraint below enforces it so
   the invariant cannot drift.

   other_job_description     — the ORIGINAL education/experience/certification/
                               environmental/physical blob, rendered on the
                               "Original Job Description" panel.
   other_job_description_ai  — the same elements from the UPDATED job
                               description, rendered on the "Updated Job
                               Description" panel.
   Both are parsed by shared/job-description-fields.ts.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.job_descriptions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.job_descriptions
    (
        id                       INT            NOT NULL,
        job_id                   INT            NOT NULL,
        job_summary_original     NVARCHAR(MAX)  NULL,
        job_summary_ai           NVARCHAR(MAX)  NULL,
        job_summary_changes      NVARCHAR(MAX)  NULL,
        other_job_description    NVARCHAR(MAX)  NULL,
        other_job_description_ai NVARCHAR(MAX)  NULL,
        is_active                BIT            NOT NULL CONSTRAINT DF_job_descriptions_is_active DEFAULT (1),
        is_critical              BIT            NOT NULL CONSTRAINT DF_job_descriptions_is_critical DEFAULT (0),
        last_edited_by           NVARCHAR(255)  NULL,
        last_updated_date        DATETIME2(0)   NULL,
        created_at               DATETIME2(0)   NOT NULL CONSTRAINT DF_job_descriptions_created_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_job_descriptions PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_job_descriptions_job_id UNIQUE (job_id),
        CONSTRAINT CK_job_descriptions_id_is_job_id CHECK (id = job_id),
        CONSTRAINT FK_job_descriptions_job FOREIGN KEY (job_id)
            REFERENCES dbo.jobs (id) ON DELETE CASCADE
    );
END
GO

/* -------------------------------------------------------------------------
   essential_functions_original / _ai / _changes
   The numbered duties, one row per duty.
     _original — as written in the legacy job description
     _ai       — as written in the updated job description (the review baseline)
     _changes  — the functional leader's edits; rewritten wholesale on save
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.essential_functions_original', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.essential_functions_original
    (
        id            INT            IDENTITY(1,1) NOT NULL,
        job_id        INT            NOT NULL,
        function_text NVARCHAR(MAX)  NOT NULL,
        sort_order    INT            NOT NULL CONSTRAINT DF_efo_sort_order DEFAULT (0),
        created_at    DATETIME2(0)   NOT NULL CONSTRAINT DF_efo_created_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_essential_functions_original PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_efo_job FOREIGN KEY (job_id) REFERENCES dbo.jobs (id) ON DELETE CASCADE
    );
    CREATE INDEX IX_efo_job_id ON dbo.essential_functions_original (job_id, sort_order);
END
GO

IF OBJECT_ID('dbo.essential_functions_ai', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.essential_functions_ai
    (
        id            INT            IDENTITY(1,1) NOT NULL,
        job_id        INT            NOT NULL,
        function_text NVARCHAR(MAX)  NOT NULL,
        sort_order    INT            NOT NULL CONSTRAINT DF_efa_sort_order DEFAULT (0),
        created_at    DATETIME2(0)   NOT NULL CONSTRAINT DF_efa_created_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_essential_functions_ai PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_efa_job FOREIGN KEY (job_id) REFERENCES dbo.jobs (id) ON DELETE CASCADE
    );
    CREATE INDEX IX_efa_job_id ON dbo.essential_functions_ai (job_id, sort_order);
END
GO

IF OBJECT_ID('dbo.essential_functions_changes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.essential_functions_changes
    (
        id            INT            IDENTITY(1,1) NOT NULL,
        job_id        INT            NOT NULL,
        function_text NVARCHAR(MAX)  NOT NULL,
        sort_order    INT            NOT NULL CONSTRAINT DF_efc_sort_order DEFAULT (0),
        created_at    DATETIME2(0)   NOT NULL CONSTRAINT DF_efc_created_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_essential_functions_changes PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_efc_job FOREIGN KEY (job_id) REFERENCES dbo.jobs (id) ON DELETE CASCADE
    );
    CREATE INDEX IX_efc_job_id ON dbo.essential_functions_changes (job_id, sort_order);
END
GO

/* -------------------------------------------------------------------------
   essential_functions
   Legacy table. Nothing writes to or reads from it; the only reference left in
   the codebase is DELETE /api/job/essentialfunction/:id in server/routes.ts,
   which would fail with "Invalid object name" if the table did not exist. Kept
   so that endpoint returns 404 rather than 500. Safe to drop once that route
   is removed or repointed at essential_functions_changes.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.essential_functions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.essential_functions
    (
        id            INT            IDENTITY(1,1) NOT NULL,
        job_id        INT            NULL,
        function_text NVARCHAR(MAX)  NULL,
        sort_order    INT            NULL,
        created_at    DATETIME2(0)   NOT NULL CONSTRAINT DF_ef_created_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_essential_functions PRIMARY KEY CLUSTERED (id)
    );
END
GO

/* -------------------------------------------------------------------------
   jd_section_changes
   Functional-leader edits to the editable JD elements (educationDesired,
   experienceDesired, certificationDesired — see JD_EDITABLE_SECTION_KEYS in
   shared/job-description-fields.ts).

   A single row with sort_order = -1 and an empty item_text means "this element
   was deliberately emptied", which is how the app tells emptied apart from
   never-edited. Do not add a NOT NULL/length constraint that rejects ''.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.jd_section_changes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.jd_section_changes
    (
        id          INT            IDENTITY(1,1) NOT NULL,
        job_id      INT            NOT NULL,
        section_key NVARCHAR(64)   NOT NULL,
        item_text   NVARCHAR(MAX)  NOT NULL,
        sort_order  INT            NOT NULL,
        created_at  DATETIME2(0)   NOT NULL CONSTRAINT DF_jsc_created_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_jd_section_changes PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_jsc_job FOREIGN KEY (job_id) REFERENCES dbo.jobs (id) ON DELETE CASCADE
    );
    CREATE INDEX IX_jsc_job_section ON dbo.jd_section_changes (job_id, section_key, sort_order);
END
GO

/* -------------------------------------------------------------------------
   job_reviewers
   The functional leaders assigned to a job. `reviewer` is the AD display name
   ("Given Sur"), which is what server/routes.ts puts in the JWT and compares
   against comments.author.

   Bootstrap note: PUT /api/job-description rejects any reviewer that is not
   already present in this table (SELECT DISTINCT reviewer FROM job_reviewers).
   Until it has at least one row, no reviewer can be assigned through the UI —
   see 99_reviewers.sample.sql.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.job_reviewers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.job_reviewers
    (
        id          INT            IDENTITY(1,1) NOT NULL,
        job_id      INT            NOT NULL,
        reviewer    NVARCHAR(255)  NOT NULL,
        assigned_at DATETIME2(0)   NOT NULL CONSTRAINT DF_job_reviewers_assigned_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_job_reviewers PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_job_reviewers_job FOREIGN KEY (job_id) REFERENCES dbo.jobs (id) ON DELETE CASCADE
    );
    CREATE INDEX IX_job_reviewers_job_id   ON dbo.job_reviewers (job_id);
    CREATE INDEX IX_job_reviewers_reviewer ON dbo.job_reviewers (reviewer);
END
GO

/* -------------------------------------------------------------------------
   comments
   author is nullable: server/routes.ts treats a NULL author as "editable by
   anyone", which is how pre-existing/imported comments behave.

   section_key is the JD element the comment is about (a JobDescriptionSections
   key, e.g. 'educationRequired'). It is nullable for imported rows; the app
   falls back to DEFAULT_COMMENT_SECTION_KEY rather than leaving a comment
   unrendered, because PUT /api/job-description deletes the caller's comments
   that are missing from the save payload.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.comments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.comments
    (
        id          INT            IDENTITY(1,1) NOT NULL,
        job_id      INT            NOT NULL,
        comment     NVARCHAR(MAX)  NULL,
        category    NVARCHAR(100)  NULL,
        author      NVARCHAR(255)  NULL,
        section_key NVARCHAR(64)   NULL,
        is_critical BIT            NOT NULL CONSTRAINT DF_comments_is_critical DEFAULT (0),
        created_at  DATETIME2(0)   NOT NULL CONSTRAINT DF_comments_created_at DEFAULT (SYSDATETIME()),
        updated_at  DATETIME2(0)   NOT NULL CONSTRAINT DF_comments_updated_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_comments PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_comments_job FOREIGN KEY (job_id) REFERENCES dbo.jobs (id) ON DELETE CASCADE
    );
    CREATE INDEX IX_comments_job_id ON dbo.comments (job_id, created_at DESC);
END
GO

/* Added after the first release; see client/20260912-MSSQL-comments-section-key.sql. */
IF COL_LENGTH('dbo.comments', 'section_key') IS NULL
    ALTER TABLE dbo.comments ADD section_key NVARCHAR(64) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_comments_job_section' AND object_id = OBJECT_ID('dbo.comments')
)
    CREATE INDEX IX_comments_job_section ON dbo.comments (job_id, section_key, created_at DESC);
GO

/* -------------------------------------------------------------------------
   notifications
   status carries the workflow label the UI shows as a badge ('Submitted to HR',
   'Accepted As Is', 'Changes Complete', 'Returned for Edits'). is_read drives
   the unread count.
   It also drives VISIBILITY: sp_GetUserNotifications / sp_GetAllNotifications
   hide rows whose status is exactly 'Submitted to HR' from anyone who is not an
   HR leader, so a notification meant for a functional leader must use a
   different label.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.notifications', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.notifications
    (
        id         INT            IDENTITY(1,1) NOT NULL,
        username   NVARCHAR(255)  NULL,
        job_id     INT            NULL,
        title      NVARCHAR(255)  NOT NULL,
        message    NVARCHAR(MAX)  NULL,
        type       NVARCHAR(20)   NOT NULL CONSTRAINT DF_notifications_type DEFAULT ('info'),
        category   NVARCHAR(50)   NULL,
        priority   NVARCHAR(20)   NOT NULL CONSTRAINT DF_notifications_priority DEFAULT ('medium'),
        is_read    BIT            NOT NULL CONSTRAINT DF_notifications_is_read DEFAULT (0),
        status     NVARCHAR(50)   NULL,
        created_at DATETIME2(0)   NOT NULL CONSTRAINT DF_notifications_created_at DEFAULT (SYSDATETIME()),
        updated_at DATETIME2(0)   NOT NULL CONSTRAINT DF_notifications_updated_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_notifications PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_notifications_job FOREIGN KEY (job_id) REFERENCES dbo.jobs (id) ON DELETE CASCADE,
        /* shared/notification.schema.ts Notification.type */
        CONSTRAINT CK_notifications_type CHECK (type IN ('info', 'warning', 'success', 'error')),
        CONSTRAINT CK_notifications_priority CHECK (priority IN ('high', 'medium', 'low'))
    );
    CREATE INDEX IX_notifications_job_id  ON dbo.notifications (job_id);
    CREATE INDEX IX_notifications_is_read ON dbo.notifications (is_read);
END
GO

/* -------------------------------------------------------------------------
   notification_settings
   Global (not per-user) toggles behind GET/PUT /api/notification-settings.
   Single-row table; the CHECK keeps it that way.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.notification_settings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.notification_settings
    (
        id                  INT          NOT NULL,
        email_notifications BIT          NOT NULL CONSTRAINT DF_notification_settings_email DEFAULT (1),
        job_updates         BIT          NOT NULL CONSTRAINT DF_notification_settings_jobs DEFAULT (1),
        updated_at          DATETIME2(0) NOT NULL CONSTRAINT DF_notification_settings_updated DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_notification_settings PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_notification_settings_singleton CHECK (id = 1)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.notification_settings WHERE id = 1)
    INSERT INTO dbo.notification_settings (id, email_notifications, job_updates) VALUES (1, 1, 1);
GO

/* -------------------------------------------------------------------------
   configuration
   Encrypted app config keyed by title. The only title the server looks up by
   name is 'active-directory' (WHERE title = 'active-directory' AND is_active = 1),
   so exactly one AD row may be active at a time — /api/config/activate/:id
   enforces that by deactivating the others first.

   json_text holds ciphertext from server/crypto.ts. The read path falls back to
   plaintext when the value starts with '{', so a hand-written JSON row works
   for local development.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.configuration', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.configuration
    (
        id         INT            IDENTITY(1,1) NOT NULL,
        title      NVARCHAR(100)  NOT NULL,
        json_text  NVARCHAR(MAX)  NOT NULL,
        is_active  BIT            NOT NULL CONSTRAINT DF_configuration_is_active DEFAULT (0),
        created_at DATETIME2(0)   NOT NULL CONSTRAINT DF_configuration_created_at DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_configuration PRIMARY KEY CLUSTERED (id)
    );
    CREATE INDEX IX_configuration_title ON dbo.configuration (title, is_active);
END
GO

/* -------------------------------------------------------------------------
   UserSearchPreferences
   Saved grid filters, keyed by AD display name + page. Mixed casing on the
   column names is intentional: server/users.routes.ts writes PageName and
   FilterJson exactly like this.
   ------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.UserSearchPreferences', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserSearchPreferences
    (
        id         INT            IDENTITY(1,1) NOT NULL,
        username   NVARCHAR(255)  NOT NULL,
        PageName   NVARCHAR(100)  NOT NULL,
        FilterJson NVARCHAR(MAX)  NULL,
        CONSTRAINT PK_UserSearchPreferences PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_UserSearchPreferences UNIQUE (username, PageName)
    );
END
GO
