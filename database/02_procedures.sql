/* =========================================================================
   Acme Health — stored procedures
   =========================================================================
   Every procedure the server calls with .execute(...). Column names are
   snake_case wherever the response passes through convertKeysToCamelCase
   (server/helper.ts), and PascalCase where server/routes.ts reads the raw
   recordset field (sp_GetJobFinalReview, sp_GetCompletedJobs) — do not
   "tidy" those two into snake_case, the route would break.

   Parameters carry defaults because the callers add them conditionally
   (see server/dashboard.routes.ts).

   "Reviewed" throughout means a job that is no longer 'Not Started'.
   ========================================================================= */

SET NOCOUNT ON;
GO

/* -------------------------------------------------------------------------
   sp_GetDashboardSummary  ->  GET /api/dashboard/summary
   Single row, shaped for shared/dashboard.schema.ts DashboardSummary.

   total_users is the count of active jobs, not people: the "Total Jobs" card
   in client/src/components/summary-cards.tsx reads data.totalUsers. revenue /
   orders / growth_rate are unused leftovers of the dashboard template and are
   returned as 0 so the interface stays satisfied.
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_GetDashboardSummary
AS
BEGIN
    SET NOCOUNT ON;

    /* Every count is ISNULL-wrapped: with no jobs at all the SUMs come back
       NULL, and summary-cards.tsx calls .toLocaleString() on them unguarded. */
    SELECT
        COUNT(*)       AS total_users,
        CAST(0 AS INT) AS revenue,
        CAST(0 AS INT) AS orders,
        CAST(0 AS INT) AS growth_rate,
        ISNULL(SUM(CASE WHEN status <> 'Not Started'                   THEN 1 ELSE 0 END), 0) AS jobs_reviewed,
        ISNULL(SUM(CASE WHEN status =  'In Progress'                   THEN 1 ELSE 0 END), 0) AS in_progress,
        ISNULL(SUM(CASE WHEN status =  'Not Started'                   THEN 1 ELSE 0 END), 0) AS not_started,
        ISNULL(SUM(CASE WHEN status IN ('Completed', 'Accepted As Is') THEN 1 ELSE 0 END), 0) AS completed,
        ISNULL(SUM(CASE WHEN status =  'Submitted to HR'               THEN 1 ELSE 0 END), 0) AS submitted_to_hr
    FROM dbo.jobs WITH (NOLOCK)
    WHERE is_active = 1;
END
GO

/* -------------------------------------------------------------------------
   sp_GetDashboardJobFamilies  ->  GET /api/dashboard/job-families
   Recordset 1: page of families (DashboardJobFamily)
   Recordset 2: TotalCount

   `reviewers` is a comma-separated string; client/src/components/data-grid.tsx
   splits it on "," to list the functional leaders.
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_GetDashboardJobFamilies
    @Page          INT            = 1,
    @PageSize      INT            = 4,
    @SearchText    NVARCHAR(255)  = NULL,
    @SortColumn    NVARCHAR(50)   = 'job_family',
    @SortDirection NVARCHAR(10)   = 'asc'
AS
BEGIN
    SET NOCOUNT ON;

    SET @Page     = CASE WHEN ISNULL(@Page, 1) < 1 THEN 1 ELSE @Page END;
    SET @PageSize = CASE WHEN ISNULL(@PageSize, 4) < 1 THEN 4 ELSE @PageSize END;
    SET @SearchText = NULLIF(LTRIM(RTRIM(ISNULL(@SearchText, ''))), '');

    /* Whitelisted so the sort can never carry SQL in from the query string. */
    SET @SortColumn = CASE LOWER(ISNULL(@SortColumn, ''))
                          WHEN 'total_jobs'    THEN 'total_jobs'
                          WHEN 'jobs_reviewed' THEN 'jobs_reviewed'
                          WHEN 'name'          THEN 'reviewers'
                          ELSE 'job_family'
                      END;
    SET @SortDirection = CASE WHEN LOWER(ISNULL(@SortDirection, '')) = 'desc' THEN 'desc' ELSE 'asc' END;

    WITH families AS
    (
        SELECT
            jf.id,
            jf.job_family,
            jf.description,
            jf.created_at,
            jf.updated_at,
            COUNT(j.id)                                                                AS total_jobs,
            SUM(CASE WHEN j.status <> 'Not Started'                   THEN 1 ELSE 0 END) AS jobs_reviewed,
            SUM(CASE WHEN j.status =  'In Progress'                   THEN 1 ELSE 0 END) AS jobs_in_progress,
            SUM(CASE WHEN j.status =  'Not Started'                   THEN 1 ELSE 0 END) AS jobs_not_started,
            SUM(CASE WHEN j.status IN ('Completed', 'Accepted As Is') THEN 1 ELSE 0 END) AS jobs_completed,
            SUM(CASE WHEN j.status =  'Submitted to HR'               THEN 1 ELSE 0 END) AS jobs_submitted_to_hr
        FROM dbo.job_families jf WITH (NOLOCK)
        LEFT JOIN dbo.jobs j WITH (NOLOCK)
               ON j.job_family_id = jf.id
              AND j.is_active = 1
        WHERE jf.is_active = 1
        GROUP BY jf.id, jf.job_family, jf.description, jf.created_at, jf.updated_at
    ),
    decorated AS
    (
        SELECT
            f.*,
            STUFF((
                SELECT DISTINCT ', ' + jr.reviewer
                FROM dbo.job_reviewers jr WITH (NOLOCK)
                JOIN dbo.jobs j2 WITH (NOLOCK) ON j2.id = jr.job_id
                WHERE j2.job_family_id = f.id AND j2.is_active = 1
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS reviewers
        FROM families f
    ),
    filtered AS
    (
        SELECT *
        FROM decorated
        WHERE @SearchText IS NULL
           OR job_family LIKE '%' + @SearchText + '%'
           OR ISNULL(description, '') LIKE '%' + @SearchText + '%'
           OR ISNULL(reviewers, '')   LIKE '%' + @SearchText + '%'
    )
    SELECT
        id,
        job_family,
        total_jobs,
        jobs_reviewed,
        jobs_in_progress,
        jobs_not_started,
        jobs_completed,
        jobs_submitted_to_hr,
        description,
        created_at,
        updated_at,
        reviewers
    FROM filtered
    ORDER BY
        CASE WHEN @SortDirection = 'asc'  AND @SortColumn = 'job_family' THEN job_family END ASC,
        CASE WHEN @SortDirection = 'desc' AND @SortColumn = 'job_family' THEN job_family END DESC,
        CASE WHEN @SortDirection = 'asc'  AND @SortColumn = 'reviewers'  THEN reviewers  END ASC,
        CASE WHEN @SortDirection = 'desc' AND @SortColumn = 'reviewers'  THEN reviewers  END DESC,
        CASE WHEN @SortDirection = 'asc'  AND @SortColumn = 'total_jobs' THEN total_jobs END ASC,
        CASE WHEN @SortDirection = 'desc' AND @SortColumn = 'total_jobs' THEN total_jobs END DESC,
        CASE WHEN @SortDirection = 'asc'  AND @SortColumn = 'jobs_reviewed' THEN jobs_reviewed END ASC,
        CASE WHEN @SortDirection = 'desc' AND @SortColumn = 'jobs_reviewed' THEN jobs_reviewed END DESC,
        id ASC
    OFFSET (@Page - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount
    FROM dbo.job_families jf WITH (NOLOCK)
    WHERE jf.is_active = 1
      AND (
            @SearchText IS NULL
         OR jf.job_family LIKE '%' + @SearchText + '%'
         OR ISNULL(jf.description, '') LIKE '%' + @SearchText + '%'
         OR EXISTS (
                SELECT 1
                FROM dbo.job_reviewers jr WITH (NOLOCK)
                JOIN dbo.jobs j2 WITH (NOLOCK) ON j2.id = jr.job_id
                WHERE j2.job_family_id = jf.id
                  AND j2.is_active = 1
                  AND jr.reviewer LIKE '%' + @SearchText + '%'
            )
          );
END
GO

/* -------------------------------------------------------------------------
   sp_GetReviewers  ->  GET /api/dashboard/reviewers
   Recordset 1: page of reviewers (DashboardReviewer)
   Recordset 2: TotalCount

   Reviewers are derived from job_reviewers rather than a users table: the app
   has no local user store, identities come from Active Directory at login and
   only the display name is persisted. `email` is therefore always NULL and
   `id` is a positional row number, stable only within a single response.
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_GetReviewers
    @Page          INT            = 1,
    @PageSize      INT            = 4,
    @SearchText    NVARCHAR(255)  = NULL,
    @SortColumn    NVARCHAR(50)   = 'full_name',
    @SortDirection NVARCHAR(10)   = 'asc'
AS
BEGIN
    SET NOCOUNT ON;

    SET @Page     = CASE WHEN ISNULL(@Page, 1) < 1 THEN 1 ELSE @Page END;
    SET @PageSize = CASE WHEN ISNULL(@PageSize, 4) < 1 THEN 4 ELSE @PageSize END;
    SET @SearchText = NULLIF(LTRIM(RTRIM(ISNULL(@SearchText, ''))), '');

    SET @SortColumn = CASE LOWER(ISNULL(@SortColumn, ''))
                          WHEN 'completed'   THEN 'completed'
                          WHEN 'in_progress' THEN 'in_progress'
                          ELSE 'full_name'
                      END;
    SET @SortDirection = CASE WHEN LOWER(ISNULL(@SortDirection, '')) = 'desc' THEN 'desc' ELSE 'asc' END;

    WITH reviewers AS
    (
        SELECT
            jr.reviewer,
            SUM(CASE WHEN j.status IN ('Completed', 'Accepted As Is') THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN j.status = 'In Progress'                    THEN 1 ELSE 0 END) AS in_progress,
            MIN(jr.assigned_at) AS created_at,
            MAX(jr.assigned_at) AS updated_at
        FROM dbo.job_reviewers jr WITH (NOLOCK)
        JOIN dbo.jobs j WITH (NOLOCK) ON j.id = jr.job_id AND j.is_active = 1
        GROUP BY jr.reviewer
    ),
    decorated AS
    (
        SELECT
            r.*,
            STUFF((
                SELECT DISTINCT ', ' + jf.job_family
                FROM dbo.job_reviewers jr2 WITH (NOLOCK)
                JOIN dbo.jobs j2 WITH (NOLOCK) ON j2.id = jr2.job_id AND j2.is_active = 1
                JOIN dbo.job_families jf WITH (NOLOCK) ON jf.id = j2.job_family_id
                WHERE jr2.reviewer = r.reviewer
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS job_family
        FROM reviewers r
    ),
    filtered AS
    (
        SELECT *
        FROM decorated
        WHERE @SearchText IS NULL
           OR reviewer LIKE '%' + @SearchText + '%'
           OR ISNULL(job_family, '') LIKE '%' + @SearchText + '%'
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY reviewer) AS id,
        reviewer      AS username,
        reviewer      AS full_name,
        CAST(NULL AS NVARCHAR(255)) AS email,
        job_family,
        completed,
        in_progress,
        reviewer      AS responsible,
        created_at,
        updated_at
    FROM filtered
    ORDER BY
        CASE WHEN @SortDirection = 'asc'  AND @SortColumn = 'full_name'   THEN reviewer    END ASC,
        CASE WHEN @SortDirection = 'desc' AND @SortColumn = 'full_name'   THEN reviewer    END DESC,
        CASE WHEN @SortDirection = 'asc'  AND @SortColumn = 'completed'   THEN completed   END ASC,
        CASE WHEN @SortDirection = 'desc' AND @SortColumn = 'completed'   THEN completed   END DESC,
        CASE WHEN @SortDirection = 'asc'  AND @SortColumn = 'in_progress' THEN in_progress END ASC,
        CASE WHEN @SortDirection = 'desc' AND @SortColumn = 'in_progress' THEN in_progress END DESC,
        reviewer ASC
    OFFSET (@Page - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount
    FROM (
        SELECT jr.reviewer
        FROM dbo.job_reviewers jr WITH (NOLOCK)
        JOIN dbo.jobs j WITH (NOLOCK) ON j.id = jr.job_id AND j.is_active = 1
        LEFT JOIN dbo.job_families jf WITH (NOLOCK) ON jf.id = j.job_family_id
        GROUP BY jr.reviewer
        HAVING @SearchText IS NULL
            OR jr.reviewer LIKE '%' + @SearchText + '%'
            OR MAX(CASE WHEN jf.job_family LIKE '%' + @SearchText + '%' THEN 1 ELSE 0 END) = 1
    ) t;
END
GO

/* -------------------------------------------------------------------------
   sp_SearchJobs  ->  GET /api/jobs
   One recordset. total_count is repeated on every row because the route reads
   it from items[0].total_count (server/routes.ts).

   @reviewer_id is declared NVARCHAR because the caller passes the reviewer's
   name through sql.VarChar; matching is against job_reviewers.reviewer.
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_SearchJobs
    @search_term   NVARCHAR(255) = NULL,
    @job_family_id INT           = NULL,
    @status        NVARCHAR(50)  = NULL,
    @reviewer_id   NVARCHAR(255) = NULL,
    @page          INT           = 1,
    @limit         INT           = 10,
    @sortField     NVARCHAR(50)  = 'job_title',
    @sortOrder     NVARCHAR(4)   = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;

    SET @page  = CASE WHEN ISNULL(@page, 1) < 1 THEN 1 ELSE @page END;
    SET @limit = CASE WHEN ISNULL(@limit, 10) < 1 THEN 10 ELSE @limit END;
    SET @search_term = NULLIF(LTRIM(RTRIM(ISNULL(@search_term, ''))), '');
    SET @status      = NULLIF(LTRIM(RTRIM(ISNULL(@status, ''))), '');
    SET @reviewer_id = NULLIF(LTRIM(RTRIM(ISNULL(@reviewer_id, ''))), '');

    SET @sortField = CASE LOWER(ISNULL(@sortField, ''))
                         WHEN 'job_code'      THEN 'job_code'
                         WHEN 'job_family'    THEN 'job_family'
                         WHEN 'reviewer_name' THEN 'reviewer_name'
                         WHEN 'status'        THEN 'status'
                         WHEN 'last_updated'  THEN 'last_updated'
                         ELSE 'job_title'
                     END;
    SET @sortOrder = CASE WHEN UPPER(ISNULL(@sortOrder, '')) = 'DESC' THEN 'DESC' ELSE 'ASC' END;

    WITH base AS
    (
        SELECT
            j.id,
            j.job_code,
            j.job_title,
            j.status,
            j.last_updated,
            j.created_at,
            jf.job_family,
            STUFF((
                SELECT ', ' + jr.reviewer
                FROM dbo.job_reviewers jr WITH (NOLOCK)
                WHERE jr.job_id = j.id
                ORDER BY jr.reviewer
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS reviewer_name
        FROM dbo.jobs j WITH (NOLOCK)
        LEFT JOIN dbo.job_families jf WITH (NOLOCK) ON jf.id = j.job_family_id
        WHERE j.is_active = 1
          AND (@job_family_id IS NULL OR j.job_family_id = @job_family_id)
          AND (@status IS NULL OR j.status = @status)
          AND (@reviewer_id IS NULL OR EXISTS (
                    SELECT 1 FROM dbo.job_reviewers jr WITH (NOLOCK)
                    WHERE jr.job_id = j.id AND jr.reviewer = @reviewer_id))
    ),
    filtered AS
    (
        SELECT *
        FROM base
        WHERE @search_term IS NULL
           OR job_code  LIKE '%' + @search_term + '%'
           OR job_title LIKE '%' + @search_term + '%'
           OR ISNULL(job_family, '')    LIKE '%' + @search_term + '%'
           OR ISNULL(reviewer_name, '') LIKE '%' + @search_term + '%'
           OR status    LIKE '%' + @search_term + '%'
    )
    SELECT
        id,
        job_code,
        job_title,
        job_family,
        reviewer_name,
        CAST(NULL AS NVARCHAR(255)) AS responsible_name,
        status,
        last_updated,
        created_at,
        COUNT(*) OVER () AS total_count
    FROM filtered
    ORDER BY
        CASE WHEN @sortOrder = 'ASC'  AND @sortField = 'job_title'     THEN job_title     END ASC,
        CASE WHEN @sortOrder = 'DESC' AND @sortField = 'job_title'     THEN job_title     END DESC,
        CASE WHEN @sortOrder = 'ASC'  AND @sortField = 'job_code'      THEN job_code      END ASC,
        CASE WHEN @sortOrder = 'DESC' AND @sortField = 'job_code'      THEN job_code      END DESC,
        CASE WHEN @sortOrder = 'ASC'  AND @sortField = 'job_family'    THEN job_family    END ASC,
        CASE WHEN @sortOrder = 'DESC' AND @sortField = 'job_family'    THEN job_family    END DESC,
        CASE WHEN @sortOrder = 'ASC'  AND @sortField = 'reviewer_name' THEN reviewer_name END ASC,
        CASE WHEN @sortOrder = 'DESC' AND @sortField = 'reviewer_name' THEN reviewer_name END DESC,
        CASE WHEN @sortOrder = 'ASC'  AND @sortField = 'status'        THEN status        END ASC,
        CASE WHEN @sortOrder = 'DESC' AND @sortField = 'status'        THEN status        END DESC,
        CASE WHEN @sortOrder = 'ASC'  AND @sortField = 'last_updated'  THEN last_updated  END ASC,
        CASE WHEN @sortOrder = 'DESC' AND @sortField = 'last_updated'  THEN last_updated  END DESC,
        id ASC
    OFFSET (@page - 1) * @limit ROWS FETCH NEXT @limit ROWS ONLY;
END
GO

/* -------------------------------------------------------------------------
   sp_GetAllJobFamilies  ->  GET /api/all-job-families  (dropdown)
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_GetAllJobFamilies
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id, job_family
    FROM dbo.job_families WITH (NOLOCK)
    WHERE is_active = 1
    ORDER BY job_family ASC;
END
GO

/* -------------------------------------------------------------------------
   sp_GetNotificationSettings / sp_UpdateNotificationSettings
   GET/PUT /api/notification-settings. Global, single row.
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_GetNotificationSettings
AS
BEGIN
    SET NOCOUNT ON;

    SELECT email_notifications, job_updates
    FROM dbo.notification_settings WITH (NOLOCK)
    WHERE id = 1;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_UpdateNotificationSettings
    @email_notifications BIT,
    @job_updates         BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.notification_settings
    SET email_notifications = @email_notifications,
        job_updates         = @job_updates,
        updated_at          = SYSDATETIME()
    WHERE id = 1;

    IF @@ROWCOUNT = 0
        INSERT INTO dbo.notification_settings (id, email_notifications, job_updates)
        VALUES (1, @email_notifications, @job_updates);
END
GO

/* -------------------------------------------------------------------------
   sp_GetUserNotifications  ->  GET /api/notifications/GetNotifications
   Recordset 1: page of notifications (shared/notification.schema.ts)
   Recordset 2: TotalCount

   @JobType is a job family name — the notifications page passes the selected
   family through as jobType.

   Visibility mirrors /api/export-notifications: HR leaders see everything,
   everyone else does not see jobs still sitting with HR.
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_GetUserNotifications
    @limit      INT           = 10,
    @page       INT           = 1,
    @JobType    NVARCHAR(150) = NULL,
    @isHRLeader BIT           = 0
AS
BEGIN
    SET NOCOUNT ON;

    SET @page  = CASE WHEN ISNULL(@page, 1) < 1 THEN 1 ELSE @page END;
    SET @limit = CASE WHEN ISNULL(@limit, 10) < 1 THEN 10 ELSE @limit END;
    SET @JobType = NULLIF(LTRIM(RTRIM(ISNULL(@JobType, ''))), '');
    SET @isHRLeader = ISNULL(@isHRLeader, 0);

    WITH visible AS
    (
        SELECT
            n.id,
            n.title,
            n.message,
            n.type,
            n.category,
            n.priority,
            n.is_read,
            n.status,
            n.created_at,
            jf.job_family AS job_type
        FROM dbo.notifications n WITH (NOLOCK)
        JOIN dbo.jobs j WITH (NOLOCK) ON j.id = n.job_id AND j.is_active = 1
        LEFT JOIN dbo.job_families jf WITH (NOLOCK) ON jf.id = j.job_family_id
        WHERE (@isHRLeader = 1 OR ISNULL(n.status, '') <> 'Submitted to HR')
          AND (@JobType IS NULL OR jf.job_family = @JobType)
    )
    SELECT id, title, message, type, category, priority, is_read, status, created_at, job_type
    FROM visible
    ORDER BY created_at DESC, id DESC
    OFFSET (@page - 1) * @limit ROWS FETCH NEXT @limit ROWS ONLY;

    SELECT COUNT(*) AS TotalCount
    FROM dbo.notifications n WITH (NOLOCK)
    JOIN dbo.jobs j WITH (NOLOCK) ON j.id = n.job_id AND j.is_active = 1
    LEFT JOIN dbo.job_families jf WITH (NOLOCK) ON jf.id = j.job_family_id
    WHERE (@isHRLeader = 1 OR ISNULL(n.status, '') <> 'Submitted to HR')
      AND (@JobType IS NULL OR jf.job_family = @JobType);
END
GO

/* -------------------------------------------------------------------------
   sp_GetAllNotifications  ->  GET /api/all_notifications
   Unpaged variant of the above.
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_GetAllNotifications
    @isHRLeader BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SET @isHRLeader = ISNULL(@isHRLeader, 0);

    SELECT
        n.id,
        n.title,
        n.message,
        n.type,
        n.category,
        n.priority,
        n.is_read,
        n.status,
        n.created_at,
        n.updated_at,
        jf.job_family AS job_type
    FROM dbo.notifications n WITH (NOLOCK)
    JOIN dbo.jobs j WITH (NOLOCK) ON j.id = n.job_id AND j.is_active = 1
    LEFT JOIN dbo.job_families jf WITH (NOLOCK) ON jf.id = j.job_family_id
    WHERE @isHRLeader = 1 OR ISNULL(n.status, '') <> 'Submitted to HR'
    ORDER BY n.created_at DESC, n.id DESC;
END
GO

/* -------------------------------------------------------------------------
   sp_UpdateNotificationStatus  ->  POST /api/notifications/UpdateStatus
   @action: 'update' (one row read/unread), 'delete' (one row),
            'bulk'   (mark every notification read/unread)
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_UpdateNotificationStatus
    @notification_id INT,
    @status          BIT         = 0,
    @action          VARCHAR(20) = 'update'
AS
BEGIN
    SET NOCOUNT ON;

    IF LOWER(ISNULL(@action, 'update')) = 'delete'
    BEGIN
        DELETE FROM dbo.notifications WHERE id = @notification_id;
        RETURN;
    END

    IF LOWER(@action) = 'bulk'
    BEGIN
        UPDATE dbo.notifications
        SET is_read = ISNULL(@status, 0), updated_at = SYSDATETIME()
        WHERE is_read <> ISNULL(@status, 0);
        RETURN;
    END

    UPDATE dbo.notifications
    SET is_read = ISNULL(@status, 0), updated_at = SYSDATETIME()
    WHERE id = @notification_id;
END
GO

/* -------------------------------------------------------------------------
   sp_GetJobFinalReview  ->  GET /api/job/finalreview?jobCode=...
   Three recordsets, read positionally in server/routes.ts:
     [0] EssentialFunctions — one row per duty
     [1] Reviewers          — one row per assigned functional leader
     [2] the job header row, PascalCase column names

   Duties come from the reviewer's edits when there are any, otherwise from the
   updated (AI) set — that is the text that was actually signed off.
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_GetJobFinalReview
    @JobCode INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @job_id INT;

    SELECT @job_id = id
    FROM dbo.jobs WITH (NOLOCK)
    WHERE TRY_CONVERT(INT, job_code) = @JobCode;

    IF EXISTS (SELECT 1 FROM dbo.essential_functions_changes WITH (NOLOCK) WHERE job_id = @job_id)
        SELECT function_text AS EssentialFunctions
        FROM dbo.essential_functions_changes WITH (NOLOCK)
        WHERE job_id = @job_id
        ORDER BY sort_order, id;
    ELSE
        SELECT function_text AS EssentialFunctions
        FROM dbo.essential_functions_ai WITH (NOLOCK)
        WHERE job_id = @job_id
        ORDER BY sort_order, id;

    SELECT reviewer AS Reviewers
    FROM dbo.job_reviewers WITH (NOLOCK)
    WHERE job_id = @job_id
    ORDER BY reviewer;

    SELECT
        j.id                                                     AS Id,
        j.job_code                                               AS Job_Code,
        j.job_title                                              AS Job_Title,
        jf.job_family                                            AS Job_Family,
        j.status                                                 AS STATUS,
        jd.last_edited_by                                        AS LastEditedBy,
        FORMAT(ISNULL(jd.last_updated_date, j.last_updated), 'MMMM dd, yyyy') AS Last_Updated,
        COALESCE(NULLIF(jd.job_summary_changes, ''), jd.job_summary_ai, jd.job_summary_original) AS JobSummary
    FROM dbo.jobs j WITH (NOLOCK)
    LEFT JOIN dbo.job_descriptions jd WITH (NOLOCK) ON jd.job_id = j.id
    LEFT JOIN dbo.job_families jf WITH (NOLOCK) ON jf.id = j.job_family_id
    WHERE j.id = @job_id;
END
GO

/* -------------------------------------------------------------------------
   sp_GetCompletedJobs  ->  GET /api/export-jobs-completed
   One flat row per finished job for the Excel export. PascalCase column names
   and the capitalised keys inside the Comments JSON are what server/routes.ts
   reads — see the formattedJobs mapping there.

   Reviewers is never NULL: the route calls .replace() on it unguarded.
   ------------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.sp_GetCompletedJobs
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        j.job_code    AS Job_Code,
        j.job_title   AS Job_Title,
        jf.job_family AS Job_Family,
        j.status      AS Status,
        COALESCE(NULLIF(jd.job_summary_changes, ''), jd.job_summary_ai, jd.job_summary_original) AS JobSummary,
        COALESCE(jd.other_job_description_ai, jd.other_job_description) AS OtherJobDescription,
        /* The reviewer's edits when there are any, otherwise the updated set. */
        COALESCE(
            STUFF((
                SELECT CHAR(10) + ef.function_text
                FROM dbo.essential_functions_changes ef WITH (NOLOCK)
                WHERE ef.job_id = j.id
                ORDER BY ef.sort_order, ef.id
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 1, ''),
            STUFF((
                SELECT CHAR(10) + ef.function_text
                FROM dbo.essential_functions_ai ef WITH (NOLOCK)
                WHERE ef.job_id = j.id
                ORDER BY ef.sort_order, ef.id
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 1, ''),
            ''
        ) AS EssentialFunctions,
        ISNULL(STUFF((
            SELECT CHAR(10) + jr.reviewer
            FROM dbo.job_reviewers jr WITH (NOLOCK)
            WHERE jr.job_id = j.id
            ORDER BY jr.reviewer
            FOR XML PATH(''), TYPE
        ).value('.', 'NVARCHAR(MAX)'), 1, 1, ''), '') AS Reviewers,
        (
            SELECT
                c.comment                                     AS Comment,
                c.category                                    AS Category,
                c.author                                      AS Author,
                c.section_key                                 AS SectionKey,
                FORMAT(c.created_at, 'MM-dd-yyyy HH:mm')      AS CreatedAt,
                c.is_critical                                 AS IsCritical
            FROM dbo.comments c WITH (NOLOCK)
            WHERE c.job_id = j.id
            ORDER BY c.created_at DESC
            FOR JSON PATH
        ) AS Comments,
        FORMAT(ISNULL(jd.last_updated_date, j.last_updated), 'MM-dd-yyyy') AS Last_Updated,
        jd.last_edited_by AS LastEditedBy
    FROM dbo.jobs j WITH (NOLOCK)
    LEFT JOIN dbo.job_descriptions jd WITH (NOLOCK) ON jd.job_id = j.id
    LEFT JOIN dbo.job_families jf WITH (NOLOCK) ON jf.id = j.job_family_id
    WHERE j.is_active = 1
      AND j.status IN ('Completed', 'Accepted As Is')
    ORDER BY j.job_code;
END
GO
