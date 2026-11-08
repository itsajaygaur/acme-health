/****** Object:  Table [dbo].[_data_load_errors]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('_data_load_errors', 'U') is not null
	DROP TABLE [_data_load_errors]
GO
CREATE TABLE [dbo].[_data_load_errors](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Error_Message] [nvarchar](max) NULL,
	[Segment] [nvarchar](255) NULL,
	[FromFile] [nvarchar](255) NULL,
	[From_Path] [nvarchar](255) NULL,
	[CreatedAt] [datetime] NULL,
 CONSTRAINT [PK_Error] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[_files_loaded]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('_files_loaded', 'U') is not null
	DROP TABLE [_files_loaded]
GO
CREATE TABLE [dbo].[_files_loaded](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[FromFile] [nvarchar](255) NULL,
	[From_Path] [nvarchar](255) NULL,
	[To_Path] [nvarchar](255) NULL,
	[CreatedAt] [datetime] NULL,
 CONSTRAINT [PK_UCH_EDI.Files_Loaded] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[essential_functions_ai]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('essential_functions_ai', 'U') is not null
	DROP TABLE [essential_functions_ai]
GO
CREATE TABLE [dbo].[essential_functions_ai](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[job_id] [int] NOT NULL,
	[function_text] [nvarchar](max) NOT NULL,
	[sort_order] [int] NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_essential_functions_ai] PRIMARY KEY CLUSTERED 
(
	[id] ASC,
	[job_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[essential_functions_changes]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('essential_functions_changes', 'U') is not null
	DROP TABLE [essential_functions_changes]
GO
CREATE TABLE [dbo].[essential_functions_changes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[job_id] [int] NOT NULL,
	[function_text] [nvarchar](max) NOT NULL,
	[sort_order] [int] NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_essential_functions_changes] PRIMARY KEY CLUSTERED 
(
	[id] ASC,
	[job_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[essential_functions_original]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('essential_functions_original', 'U') is not null
	DROP TABLE [essential_functions_original]
GO
CREATE TABLE [dbo].[essential_functions_original](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[job_id] [int] NOT NULL,
	[function_text] [nvarchar](max) NULL,
	[sort_order] [int] NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_essential_functions_original] PRIMARY KEY CLUSTERED 
(
	[id] ASC,
	[job_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[job_descriptions]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('job_descriptions', 'U') is not null
	DROP TABLE [job_descriptions]
GO
CREATE TABLE [dbo].[job_descriptions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[job_id] [int] NOT NULL,
	[version] [int] NOT NULL,
	[job_summary_original] [nvarchar](max) NULL,
	[job_summary_ai] [nvarchar](max) NULL,
	[job_summary_changes] [nvarchar](max) NULL,
	[other_job_description] [nvarchar](max) NULL,
	[comments] [nvarchar](max) NULL,
	[is_critical] [bit] NOT NULL,
	[last_edited_by_id] [int] NULL,
	[last_updated_date] [datetime2](7) NOT NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK__job_desc__3213E83F6F104183] PRIMARY KEY CLUSTERED 
(
	[id] ASC,
	[job_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[job_families]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('job_families', 'U') is not null
	DROP TABLE [job_families]
GO
CREATE TABLE [dbo].[job_families](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[job_family] [nvarchar](255) NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[job_reviewers]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('job_reviewers', 'U') is not null
	DROP TABLE [job_reviewers]
GO
CREATE TABLE [dbo].[job_reviewers](
	[job_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[assigned_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[job_id] ASC,
	[user_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[jobs]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('jobs', 'U') is not null
	DROP TABLE [jobs]
GO
CREATE TABLE [dbo].[jobs](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[job_code] [nvarchar](50) NOT NULL,
	[job_title] [nvarchar](255) NOT NULL,
	[job_family_id] [int] NULL,
	[reviewer_id] [int] NULL,
	[status] [nvarchar](50) NOT NULL,
	[last_updated] [datetime2](7) NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK__jobs__3213E83F7B430F6A] PRIMARY KEY CLUSTERED 
(
	[id] ASC,
	[job_code] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[notifications]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('notifications', 'U') is not null
	DROP TABLE [notifications]
GO
CREATE TABLE [dbo].[notifications](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[job_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[message] [nvarchar](max) NOT NULL,
	[type] [nvarchar](20) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[category] [nvarchar](50) NOT NULL,
	[priority] [nvarchar](20) NOT NULL,
	[is_read] [bit] NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK__notifica__3213E83FD573938C] PRIMARY KEY CLUSTERED 
(
	[id] ASC,
	[job_id] ASC,
	[user_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[people]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('people', 'U') is not null
	DROP TABLE [people]
GO
CREATE TABLE [dbo].[people](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[IsHRLeader] [bit] NULL,
	[last_login] [datetime2](7) NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
	[email] [varchar](255) NULL,
	[uid] [nchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('users', 'U') is not null
	DROP TABLE [users]
GO
CREATE TABLE [dbo].[users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[email] [varchar](255) NULL,
	[password] [varchar](255) NULL,
	[role] [varchar](255) NULL,
	[department] [varchar](255) NULL,
	[status] [nvarchar](20) NOT NULL,
	[IsHRLeader] [bit] NULL,
	[last_login] [datetime2](7) NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserSearchPreferences]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF object_id('UserSearchPreferences', 'U') is not null
	DROP TABLE [UserSearchPreferences]
GO
CREATE TABLE [dbo].[UserSearchPreferences](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[PageName] [nvarchar](100) NOT NULL,
	[FilterJson] [nvarchar](max) NOT NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
 CONSTRAINT [PK__UserSear__3214EC0746048620] PRIMARY KEY CLUSTERED 
(
	[Id] ASC,
	[UserId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[configuration]    Script Date: 23-06-2025 12:19:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[configuration](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[title] [nvarchar](50) NULL,
	[json_text] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_configuration] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[essential_functions_ai] ADD  CONSTRAINT [DF_essential_functions_ai_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[essential_functions_ai] ADD  CONSTRAINT [DF_essential_functions_ai_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[essential_functions_changes] ADD  CONSTRAINT [DF_essential_functions_changes_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[essential_functions_changes] ADD  CONSTRAINT [DF_essential_functions_changes_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[essential_functions_original] ADD  CONSTRAINT [DF_original_essential_functions_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[essential_functions_original] ADD  CONSTRAINT [DF_original_essential_functions_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[job_descriptions] ADD  CONSTRAINT [DF_job_descriptions_is_critical]  DEFAULT ((0)) FOR [is_critical]
GO
ALTER TABLE [dbo].[job_descriptions] ADD  CONSTRAINT [DF_job_descriptions_last_updated_date]  DEFAULT (getdate()) FOR [last_updated_date]
GO
ALTER TABLE [dbo].[job_descriptions] ADD  CONSTRAINT [DF_job_descriptions_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[job_descriptions] ADD  CONSTRAINT [DF_job_descriptions_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[job_families] ADD  CONSTRAINT [DF_job_families_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[job_families] ADD  CONSTRAINT [DF_job_families_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[job_reviewers] ADD  CONSTRAINT [DF_job_reviewers_assigned_at]  DEFAULT (getdate()) FOR [assigned_at]
GO
ALTER TABLE [dbo].[jobs] ADD  CONSTRAINT [DF_jobs_last_updated]  DEFAULT (getdate()) FOR [last_updated]
GO
ALTER TABLE [dbo].[jobs] ADD  CONSTRAINT [DF_jobs_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[jobs] ADD  CONSTRAINT [DF_jobs_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[notifications] ADD  CONSTRAINT [DF_notifications_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[notifications] ADD  CONSTRAINT [DF_notifications_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[people] ADD  CONSTRAINT [DF_people_last_login]  DEFAULT (getdate()) FOR [last_login]
GO
ALTER TABLE [dbo].[people] ADD  CONSTRAINT [DF_people_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[people] ADD  CONSTRAINT [DF_people_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[users] ADD  CONSTRAINT [DF_users_last_login]  DEFAULT (getdate()) FOR [last_login]
GO
ALTER TABLE [dbo].[users] ADD  CONSTRAINT [DF_users_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  CONSTRAINT [DF_users_updated_at]  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[UserSearchPreferences] ADD  CONSTRAINT [DF_UserSearchPreferences_CreatedAt]  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserSearchPreferences] ADD  CONSTRAINT [DF_UserSearchPreferences_UpdatedAt]  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[configuration] ADD  CONSTRAINT [DF_configuration_created_at]  DEFAULT (getdate()) FOR [created_at]
GO
/****** Object:  StoredProcedure [dbo].[sp_CleanupOldData]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Clean up old data (maintenance)
CREATE OR ALTER  PROCEDURE [dbo].[sp_CleanupOldData]
    @days_to_keep INT = 90
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @audit_deleted INT;
    DECLARE @notifications_deleted INT;
    DECLARE @job_descriptions_deleted INT;
    DECLARE @cutoff_date DATETIME2 = DATEADD(DAY, -@days_to_keep, GETDATE());
    DECLARE @notification_cutoff_date DATETIME2 = DATEADD(DAY, -(@days_to_keep / 2), GETDATE());
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Delete old audit logs
        DELETE FROM audit_log 
        WHERE created_at < @cutoff_date;
        SET @audit_deleted = @@ROWCOUNT;
        
        -- Delete old read notifications
        DELETE FROM notifications 
        WHERE is_read = 1 AND created_at < @notification_cutoff_date;
        SET @notifications_deleted = @@ROWCOUNT;
        
        -- Delete old inactive job description versions (keep last 5 versions)
        DELETE jd1
        FROM job_descriptions jd1
        WHERE is_active = 0 
        AND created_at < @cutoff_date
        AND (
            SELECT COUNT(*) 
            FROM job_descriptions jd2 
            WHERE jd2.job_id = jd1.job_id 
            AND jd2.version > jd1.version
        ) > 5;
        SET @job_descriptions_deleted = @@ROWCOUNT;
        
        COMMIT TRANSACTION;
        
        -- Return cleanup results
        SELECT 
            @audit_deleted AS audit_logs_deleted,
            @notifications_deleted AS old_notifications_deleted,
            @job_descriptions_deleted AS inactive_job_descriptions_deleted;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateUser]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- sp_CreateUser
CREATE OR ALTER  PROCEDURE [dbo].[sp_CreateUser]
    @name NVARCHAR(100),
    @email NVARCHAR(100),
	@password NVARCHAR(100),
    @role NVARCHAR(50),
    @department NVARCHAR(100),
    @status NVARCHAR(50)
AS
BEGIN
    INSERT INTO Users (name, email, password, role, department, status, last_login)
    VALUES (@name, @email,@password, @role, @department, @status, GETDATE());
    
    SELECT 
        SCOPE_IDENTITY() AS id,
        @name AS name,
        @email AS email,
        @role AS role,
        @department AS department,
        @status AS status,
        GETDATE() AS last_login;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteUser]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER  PROCEDURE [dbo].[sp_DeleteUser]
    @userId INT
AS
BEGIN
    UPDATE Users
    SET status = 'InActive'
    WHERE id = @userId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAllJobFamilies]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Get aLL job families for dropdown
CREATE OR ALTER  PROCEDURE [dbo].[sp_GetAllJobFamilies]
AS
BEGIN
    SET NOCOUNT ON;
   SELECT id, job_family FROM [dbo].[job_families]
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAllNotifications]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- Procedure: Get unread user notifications (is_read = 0)
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllNotifications] 
(
    @user_id INT = NULL
)
AS  
BEGIN  
    SET NOCOUNT ON;  

	
	DECLARE @RoleType VARCHAR(25);

	SELECT @RoleType = role FROM users WHERE Id = @user_id;
  
    -- Main result with hyperlink-injected messages  
    WITH ParsedNotifications AS (  
        SELECT   
            id,  
            title,  
            message,  
            type,  
            category,  
            priority,  
            is_read,  
            created_at,  
			status,  
            LOWER(message) AS lower_message,
			CASE WHEN status = 'Submitted to HR' AND @RoleType = 'Reviewer' THEN 0 ELSE 1 END AS ShowNotification
        FROM notifications  
        WHERE is_read = 0 -- Only unread  
    ),  
    Matches AS (  
        SELECT   
            *,  
            PATINDEX('%job%', lower_message) AS job_pos,  
            PATINDEX('%[0-9]%', lower_message) AS first_digit_pos  
        FROM ParsedNotifications  
		WHERE ShowNotification = 1
    ),  
    Extracted AS (  
        SELECT   
            *,  
            -- Extract the full number near the word "job"  
            CASE   
                WHEN job_pos > 0 AND first_digit_pos > 0 AND ABS(job_pos - first_digit_pos) < 10 THEN  
                    LEFT(  
                        SUBSTRING(message, first_digit_pos, 100),   
                        PATINDEX('%[^0-9]%', SUBSTRING(message, first_digit_pos, 100) + 'X') - 1  
                    )  
                ELSE NULL  
            END AS job_number  
        FROM Matches  
    ),  
    Final AS (  
        SELECT   
            id,  
            title,  
            type,  
            category,  
            priority,  
            is_read,  
            created_at,  
            message,  
            job_number,  
   status,  
            -- Replace only the number with hyperlink  
            CASE   
                WHEN job_number IS NOT NULL THEN  
                    REPLACE(  
                        message,   
                        job_number,   
                        '<a class="text-blue-600 hover:text-blue-800 underline transition-colors" href="editing?jobCode=' + job_number + '">' + job_number + '</a>'  
                    )  
                ELSE message  
            END AS message_with_link  
        FROM Extracted  
    )  
    SELECT   
        id,  
        title,  
        message_with_link AS message,  
        type,  
        category,  
        priority,  
        is_read,  
  status,  
        created_at  
    FROM Final  
    ORDER BY created_at DESC;  
  
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAuditTrail]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Get audit trail for a specific entity
CREATE OR ALTER  PROCEDURE [dbo].[sp_GetAuditTrail]
    @entity_type NVARCHAR(100),
    @entity_id INT = NULL,
    @limit INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@limit)
        al.id,
        u.name AS user_name,
        al.action,
        al.details,
        al.ip_address,
        al.created_at
    FROM audit_log al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.entity_type = @entity_type 
    AND (@entity_id IS NULL OR al.entity_id = @entity_id)
    ORDER BY al.created_at DESC;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_GetDashboardJobFamilies]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- Procedure: Get job families for dashboard
CREATE OR ALTER PROCEDURE [dbo].[sp_GetDashboardJobFamilies] --1, 4, 'man'    
(    
    @Page INT = 1,    
    @PageSize INT = 10,    
    @SearchText NVARCHAR(100) = NULL,    
    @SortColumn NVARCHAR(50) = 'job_family',    
    @SortDirection NVARCHAR(4) = 'asc'    
)    
AS    
BEGIN    
    SET NOCOUNT ON;    
    
--   -- Page offset    
DECLARE @Offset INT = (@Page - 1) * @PageSize;    
    
-- Distinct reviewers CTE    
WITH DistinctReviewers AS (    
    SELECT DISTINCT     
        jf.id AS job_family_id,    
        u.name AS reviewer_name    
    FROM job_families jf    
    JOIN jobs j ON j.job_family_id = jf.id    
    JOIN job_reviewers jr ON jr.job_id = j.id    
    JOIN people u ON u.id = jr.user_id    
    WHERE     
        (@SearchText IS NULL     
         OR jf.job_family LIKE '%' + @SearchText + '%'    
         OR u.name LIKE '%' + @SearchText + '%')    
),    
ReviewersAgg AS (    
    SELECT     
        dr.job_family_id,    
  STRING_AGG(dr.reviewer_name, ', ') as reviewers    
    FROM DistinctReviewers dr    
    GROUP BY dr.job_family_id    
),    
JobStats AS (    
    SELECT     
        jf.id AS job_family_id,    
        jf.job_family,    
        --jd.job_summary_changes,    
        --jf.created_at,    
        --jf.updated_at,    
        COUNT(DISTINCT j.id) AS total_jobs,    
        SUM(CASE WHEN j.status NOT IN ('Not Started') THEN 1 ELSE 0 END) AS jobs_reviewed,    
        SUM(CASE WHEN j.status = 'Not Started' THEN 1 ELSE 0 END) AS jobs_not_started,    
        SUM(CASE WHEN j.status = 'In Progress' THEN 1 ELSE 0 END) AS inprogress,    
        SUM(CASE WHEN j.status = 'Completed' THEN 1 ELSE 0 END) AS completed,    
        SUM(CASE WHEN j.status = 'Submitted to HR' THEN 1 ELSE 0 END) AS submitted_to_hr    
    FROM job_families jf    
    LEFT JOIN jobs j ON j.job_family_id = jf.id    
 --left join job_descriptions jd on jd.job_id = j.id    
   -- WHERE     
   --     (@SearchText IS NULL     
   --      OR jf.job_family LIKE '%' + @SearchText + '%'    
   ----OR u.name  LIKE '%' + @SearchText + '%'
   --)    
    GROUP BY
       jf.id, jf.job_family--, jf.created_at, jf.updated_at    
)    
    
-- Final query with reviewers attached    
SELECT     
    js.*,    
    ISNULL(ra.reviewers, '') AS reviewers    
FROM JobStats js    
JOIN ReviewersAgg ra ON js.job_family_id = ra.job_family_id  
--WHERE (@SearchText IS NULL OR reviewers LIKE '%' + @SearchText + '%')
-- WHERE     
--         (@SearchText IS NULL     
--          OR CAST(js.total_jobs AS VARCHAR) LIKE '%' + @SearchText + '%'    
--    OR CAST(js.jobs_reviewed AS VARCHAR) LIKE '%' + @SearchText + '%')    
ORDER BY     
    CASE WHEN @SortColumn = 'job_family' AND @SortDirection = 'asc' THEN job_family END ASC,    
    CASE WHEN @SortColumn = 'job_family' AND @SortDirection = 'desc' THEN job_family END DESC,    
    CASE WHEN @SortColumn = 'total_jobs' AND @SortDirection = 'asc' THEN total_jobs END ASC,    
    CASE WHEN @SortColumn = 'total_jobs' AND @SortDirection = 'desc' THEN total_jobs END DESC,    
    CASE WHEN @SortColumn = 'jobs_reviewed' AND @SortDirection = 'asc' THEN jobs_reviewed END ASC,    
    CASE WHEN @SortColumn = 'jobs_reviewed' AND @SortDirection = 'desc' THEN jobs_reviewed END DESC
    --CASE WHEN @SortColumn = 'created_at' AND @SortDirection = 'asc' THEN created_at END ASC,    
    --CASE WHEN @SortColumn = 'created_at' AND @SortDirection = 'desc' THEN created_at END DESC    
OFFSET @Offset ROWS    
FETCH NEXT @PageSize ROWS ONLY;    
    
-- Total count    
SELECT COUNT(*) AS TotalCount    
FROM (    
    SELECT DISTINCT jf.id    
    FROM job_families jf    
    LEFT JOIN jobs j ON jf.id = j.job_family_id    
    LEFT JOIN job_reviewers jr ON jr.job_id = j.id    
    LEFT JOIN people u ON u.id = jr.user_id    
    WHERE     
        (@SearchText IS NULL     
         OR jf.job_family LIKE '%' + @SearchText + '%'    
         OR u.name LIKE '%' + @SearchText + '%')    
   --OR total_jobs LIKE '%' + @SearchText + '%'    
   --OR jobs_reviewed  LIKE '%' + @SearchText + '%'    
) AS FilteredFamilies;    
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_GetDashboardSummary]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Get dashboard summary with calculated metrics
CREATE OR ALTER  PROCEDURE [dbo].[sp_GetDashboardSummary]
AS
BEGIN  
    SET NOCOUNT ON;  
      
    DECLARE @total_users INT;  
    DECLARE @revenue DECIMAL(12, 2) = 0.0;  
    DECLARE @orders INT = 0;  
    DECLARE @growth_rate DECIMAL(5, 2);  
    DECLARE @jobs_reviewed INT;  
    DECLARE @in_progress INT;  
    DECLARE @not_started INT;  
    DECLARE @completed INT;  
    DECLARE @submitted_to_hr INT;  
      
    SELECT @total_users = COUNT(*) FROM jobs;   
    --SELECT @revenue = ISNULL(SUM(amount), 0) FROM transactions WHERE status = 'Completed';  
    --SELECT @orders = COUNT(*) FROM transactions;  
      
    DECLARE @total_jobs INT;  
    SELECT @total_jobs = COUNT(*) FROM jobs;  
      
    IF @total_jobs > 0  
        SELECT @growth_rate = (CAST(COUNT(*) AS DECIMAL(5,2)) * 100.0 / @total_jobs)   
        FROM jobs WHERE status IN ('Completed', 'Reviewed');  
    ELSE  
        SET @growth_rate = 0.00;  
      
    SELECT @jobs_reviewed = COUNT(*) FROM jobs WHERE status IN ('Completed', 'Reviewed');  
    SELECT @in_progress = COUNT(*) FROM jobs WHERE status = 'In Progress';  
    SELECT @not_started = COUNT(*) FROM jobs WHERE status = 'Not Started';  
    SELECT @completed = COUNT(*) FROM jobs WHERE status IN ('Completed', 'Accepted As Is');  
    SELECT @submitted_to_hr = COUNT(*) FROM jobs WHERE status = 'Submitted to HR';  
      
    SELECT   
        @total_users AS total_users,  
        @revenue AS revenue,  
        @orders AS orders,  
        @growth_rate AS growth_rate,  
        @jobs_reviewed AS jobs_reviewed,  
        @in_progress AS in_progress,  
        @not_started AS not_started,  
        @completed AS completed,  
        @submitted_to_hr AS submitted_to_hr;  
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_GetEssentialFunctions]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Get job with full details including descriptions and functions
-- CREATE OR ALTER PROCEDURE sp_GetJobDetails
--     @job_code NVARCHAR(50)
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     SELECT 
--         j.id AS job_id,
--         j.job_code,
--         j.job_title,
--         jf.job_family,
--         u1.name AS reviewer_name,
--         j.status,
--         j.last_updated,
--         jd.id AS job_description_id,
--         jd.job_summary,
--         jd.version,
--         u3.name AS last_edited_by,
--         jd.last_updated_date
--     FROM jobs j
--     LEFT JOIN job_families jf ON j.job_family_id = jf.id
--     LEFT JOIN users u1 ON j.reviewer_id = u1.id
--     LEFT JOIN job_descriptions jd ON j.id = jd.job_id AND jd.is_active = 1
--     LEFT JOIN users u3 ON jd.last_edited_by_id = u3.id
--     WHERE j.job_code = @job_code;
-- END;
-- GO

-- Procedure: Get essential functions for a job description
CREATE OR ALTER  PROCEDURE [dbo].[sp_GetEssentialFunctions]
    @job_description_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        id,
        function_text,
        sort_order,
        has_edit,
        created_at,
        updated_at
    FROM essential_functions
    WHERE job_description_id = @job_description_id
    ORDER BY sort_order;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_GetJobFinalReview]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER  PROCEDURE [dbo].[sp_GetJobFinalReview]
(
	@JobCode INT
)
AS
BEGIN
	SET NOCOUNT ON
	DECLARE @JobID INT;

	SELECT @JobID = id FROM Jobs WHERE Job_Code = @JobCode

	SELECT 
		ISNULL(Function_Text, 'No Data Found') AS EssentialFunctions
	FROM Essential_Functions_Changes
	WHERE Job_Id = @jobId
	ORDER BY Sort_Order

	SELECT 
		Name AS Reviewers
	FROM People U
	INNER JOIN 
		Job_Reviewers JR ON JR.User_Id = U.Id
	WHERE 
		JR.Job_Id = @jobId

	SELECT J.Id,
		J.Job_Title,
		J.Job_Code,
		JF.Job_Family,
		'Completed' AS STATUS,
		ISNULL(U.Name, 'N/A') AS LastEditedBy,
		FORMAT(J.Last_Updated, 'MMMM d, yyyy') AS Last_Updated,
		ISNULL(JD.Job_Summary_Changes, 'No Changes Found') AS JobSummary
	FROM Jobs J
	LEFT JOIN Job_Families JF ON JF.Id = J.Job_Family_Id
	LEFT JOIN Job_Descriptions JD ON JD.Job_Id = J.Id
	LEFT JOIN People U ON U.Id = J.Reviewer_Id
	WHERE 
		J.Id = @jobId
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_GetJobStatistics]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- utility procedures

-- Procedure: Get job statistics by status
CREATE OR ALTER  PROCEDURE [dbo].[sp_GetJobStatistics]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        status,
        COUNT(*) AS job_count,
        CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM jobs) AS DECIMAL(5,2)) AS percentage
    FROM jobs
    GROUP BY status
    ORDER BY job_count DESC;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_GetNotificationSettings]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Get all notification settings
-- CREATE OR ALTER  PROCEDURE [dbo].[sp_GetNotificationSettings]
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     SELECT TOP 1
--         email_notifications,
--         job_updates
--     FROM notification_settings
--     ORDER BY id ASC;
-- END
-- GO
/****** Object:  StoredProcedure [dbo].[sp_GetReviewers]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Get reviews for dashboard
CREATE OR ALTER  PROCEDURE [dbo].[sp_GetReviewers]  
(  
    @Page INT = 1,  
    @PageSize INT = 10,  
    @SearchText NVARCHAR(100) = NULL,  
    @SortColumn NVARCHAR(50) = 'full_name',  
    @SortDirection NVARCHAR(4) = 'asc'
)  
AS  
BEGIN  
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    -- Step 1: Aggregate reviewer data
    ;WITH ReviewerStats AS (
		SELECT 
			u.id,
			u.Name as full_name,
			COUNT(CASE WHEN j.Status IN ('Completed', 'Accepted As Is') THEN 1 END) AS completed,
			COUNT(CASE WHEN j.Status = 'In Progress' THEN 1 END) AS in_progress
			FROM 
			People u
			LEFT JOIN 
			job_reviewers r ON u.id = r.user_id
			LEFT JOIN 
			Jobs j ON r.job_id = j.id
			GROUP BY 
			u.id, u.Name
    )

    -- Step 2: Apply search filtering
    SELECT id, full_name, in_progress, completed
    INTO #FilteredReviewers
    FROM ReviewerStats
    WHERE @SearchText IS NULL
        OR full_name LIKE '%' + @SearchText + '%'
        OR CAST(in_progress AS NVARCHAR) LIKE '%' + @SearchText + '%'
        OR CAST(completed AS NVARCHAR) LIKE '%' + @SearchText + '%';

    -- Step 3: Paginated result with optimized sorting
    SELECT id, full_name, in_progress, completed
    FROM #FilteredReviewers
    ORDER BY
        CASE WHEN @SortColumn = 'full_name' AND @SortDirection = 'asc' THEN full_name END ASC,
        CASE WHEN @SortColumn = 'full_name' AND @SortDirection = 'desc' THEN full_name END DESC,
        CASE WHEN @SortColumn = 'completed' AND @SortDirection = 'asc' THEN completed END ASC,
        CASE WHEN @SortColumn = 'completed' AND @SortDirection = 'desc' THEN completed END DESC,
        CASE WHEN @SortColumn = 'in_progress' AND @SortDirection = 'asc' THEN in_progress END ASC,
        CASE WHEN @SortColumn = 'in_progress' AND @SortDirection = 'desc' THEN in_progress END DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    -- Step 4: Count for pagination
    SELECT COUNT(1) AS TotalCount FROM #FilteredReviewers;

    -- Cleanup
    DROP TABLE #FilteredReviewers;
END;


GO
/****** Object:  StoredProcedure [dbo].[sp_GetSearchUsers]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER  PROCEDURE [dbo].[sp_GetSearchUsers]
    @search    NVARCHAR(100) = NULL,
    @role      NVARCHAR(50)  = NULL,
    @status    NVARCHAR(50)  = NULL,
    @sortBy    NVARCHAR(50)  = 'name',
    @sortOrder NVARCHAR(10)  = 'asc'
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate sort columns to prevent SQL injection
    IF @sortBy NOT IN ('name', 'email', 'role', 'department', 'status', 'last_login')
        SET @sortBy = 'name';

    -- Validate sort order
    IF UPPER(@sortOrder) NOT IN ('ASC', 'DESC')
        SET @sortOrder = 'ASC';

    SELECT 
        id, 
        name, 
        email, 
        role, 
        department, 
        status, 
        FORMAT(last_login, 'MMMM dd, yyyy') as last_login,
        COUNT(*) OVER() AS TotalCount
    FROM Users
    WHERE
        (@search IS NULL OR
            name       LIKE '%' + @search + '%' OR
            email      LIKE '%' + @search + '%' OR
            department LIKE '%' + @search + '%'
        )
        AND (@role   IS NULL OR role   = @role)
        AND (@status IS NULL OR status = @status)
    ORDER BY
        -- name
        CASE WHEN @sortBy = 'name'      AND @sortOrder = 'ASC'  THEN name      END ASC,
        CASE WHEN @sortBy = 'name'      AND @sortOrder = 'DESC' THEN name      END DESC,
        -- email
        CASE WHEN @sortBy = 'email'     AND @sortOrder = 'ASC'  THEN email     END ASC,
        CASE WHEN @sortBy = 'email'     AND @sortOrder = 'DESC' THEN email     END DESC,
        -- role
        CASE WHEN @sortBy = 'role'      AND @sortOrder = 'ASC'  THEN role      END ASC,
        CASE WHEN @sortBy = 'role'      AND @sortOrder = 'DESC' THEN role      END DESC,
        -- department
        CASE WHEN @sortBy = 'department' AND @sortOrder = 'ASC'  THEN department END ASC,
        CASE WHEN @sortBy = 'department' AND @sortOrder = 'DESC' THEN department END DESC,
        -- status
        CASE WHEN @sortBy = 'status'    AND @sortOrder = 'ASC'  THEN status    END ASC,
        CASE WHEN @sortBy = 'status'    AND @sortOrder = 'DESC' THEN status    END DESC,
        -- lastLogin
        CASE WHEN @sortBy = 'last_login' AND @sortOrder = 'ASC'  THEN last_login END ASC,
        CASE WHEN @sortBy = 'last_login' AND @sortOrder = 'DESC' THEN last_login END DESC,
        -- fallback deterministic order
        id ASC;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetTopReviewers]    Script Date: 6/20/2025 3:25:30 PM *****
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Get top reviewers by completed jobs
CREATE OR ALTER  PROCEDURE [dbo].[sp_GetTopReviewers]
    @limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@limit)
        u.id,
        u.name,
        u.email,
        COUNT(j.id) AS completed_jobs,
        AVG(DATEDIFF(DAY, j.created_at, j.last_updated)) AS avg_days_to_complete
    FROM users u
    INNER JOIN jobs j ON u.id = j.reviewer_id
    WHERE j.status IN ('Completed', 'Reviewed')
    AND u.status = 'Active'
    GROUP BY u.id, u.name, u.email
    ORDER BY completed_jobs DESC, avg_days_to_complete ASC;
END;
GO
*/
/****** Object:  StoredProcedure [dbo].[sp_GetUserById]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- sp_GetUserById
CREATE OR ALTER  PROCEDURE [dbo].[sp_GetUserById]
    @userId INT
AS
BEGIN
    SELECT 
        id, 
        name, 
        email, 
        role, 
        department, 
        status, 
        last_login
    FROM Users
    WHERE id = @userId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetUserNotifications]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Get user notifications with pagination
CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserNotifications]
    @user_id INT = NULL,
    @page INT = 1,
    @limit INT = 10,
    @JobType NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @limit;

 --   SELECT 
 --       id,
 --       title,
 --       message,
 --       type,
 --       category,
 --       priority,
 --       is_read,
 --       created_at
 --   FROM notifications
 --   --	WHERE (user_id = @user_id OR @user_id IS NULL)
 --   ORDER BY created_at DESC
 --   OFFSET @offset ROWS
 --   FETCH NEXT @limit ROWS ONLY;

	---- Total count after search filter
 --   SELECT COUNT(1) AS TotalCount
 --   FROM notifications
 --   --WHERE user_id = @user_id OR @user_id IS NULL;

 -- Main paged result with hyperlink-injected messages
-- Main paged result with hyperlink-injected messages and jobType


DECLARE @RoleType VARCHAR(25);

SELECT @RoleType = role FROM users WHERE Id = @user_id;

WITH ParsedNotifications AS (
        SELECT 
            n.id,
            n.title,
            n.message,
            n.type,
            n.status,
            n.priority,
            n.is_read,
            n.created_at,
            LOWER(n.message) AS lower_message,
            n.job_id,
            jf.job_family AS jobType,
			CASE WHEN n.status = 'Submitted to HR' AND @RoleType = 'Reviewer' THEN 0 ELSE 1 END AS ShowNotification
        FROM notifications n
        LEFT JOIN jobs j ON j.id = n.job_id
        LEFT JOIN job_families jf ON jf.id = j.job_family_id
        WHERE (@JobType IS NULL OR jf.job_family LIKE '%' + @JobType + '%')
		--AND CASE WHEN @RoleType = 'Admin' THEN 1 ELSE 0 END = 1
    ),
    Matches AS (
        SELECT 
            *,
            PATINDEX('%job%', lower_message) AS job_pos,
            PATINDEX('%[0-9]%', lower_message) AS first_digit_pos
        FROM ParsedNotifications
		WHERE ShowNotification = 1
    ),
    Extracted AS (
        SELECT 
            *,
            CASE 
                WHEN job_pos > 0 AND first_digit_pos > 0 AND ABS(job_pos - first_digit_pos) < 10 THEN
                    LEFT(
                        SUBSTRING(message, first_digit_pos, 100), 
                        PATINDEX('%[^0-9]%', SUBSTRING(message, first_digit_pos, 100) + 'X') - 1
                    )
                ELSE NULL
            END AS job_number
        FROM Matches
    ),
    Final AS (
        SELECT 
            id,
            title,
            type,
            status,
            priority,
            is_read,
            created_at,
            message,
            job_number,
            jobType,
            CASE 
                WHEN job_number IS NOT NULL THEN
                    REPLACE(
                        message, 
                        job_number, 
                        '<a class="text-blue-600 hover:text-blue-800 underline transition-colors" href="editing?jobCode=' + job_number + '">' + job_number + '</a>'
                    )
                ELSE message
            END AS message_with_link
        FROM Extracted
    )
    SELECT 
        id,
        title,
        message_with_link AS message,
        type,
        status,
        priority,
        is_read,
        created_at,
        jobType
    FROM Final
    ORDER BY created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY;

    -- Total count (optionally filter by jobType too)
    SELECT COUNT(1) AS TotalCount
    FROM notifications n
    LEFT JOIN jobs j ON j.id = n.job_id
    LEFT JOIN job_families jf ON jf.id = j.job_family_id
    WHERE (@JobType IS NULL OR jf.job_family LIKE '%' + @JobType + '%');

END;
GO
/****** Object:  StoredProcedure [dbo].[sp_ReorderEssentialFunctions]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Create new job with initial job description
-- CREATE OR ALTER PROCEDURE sp_CreateJobWithDescription
--     @job_code NVARCHAR(50),
--     @job_title NVARCHAR(255),
--     @job_family_id INT,
--     @reviewer_id INT,
--     @job_summary NVARCHAR(MAX),
--     @created_by_id INT,
--     @job_id INT OUTPUT
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     DECLARE @job_description_id INT;
    
--     BEGIN TRY
--         BEGIN TRANSACTION;
        
--         -- Insert job
--         INSERT INTO jobs (job_code, job_title, job_family_id, reviewer_id, status)
--         VALUES (@job_code, @job_title, @job_family_id, @reviewer_id, 'Not Started');
        
--         SET @job_id = SCOPE_IDENTITY();
        
--         -- Insert initial job description
--         INSERT INTO job_descriptions (job_id, job_summary, original_job_summary, last_edited_by_id, version)
--         VALUES (@job_id, @job_summary, @job_summary, @created_by_id, 1);
        
--         SET @job_description_id = SCOPE_IDENTITY();
        
--         -- Log audit entry
--         INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
--         VALUES (@created_by_id, 'CREATE', 'job', @job_id, 
--                 '{"job_code":"' + @job_code + '","job_title":"' + @job_title + '"}');
        
--         COMMIT TRANSACTION;
        
--     END TRY
--     BEGIN CATCH
--         ROLLBACK TRANSACTION;
--         THROW;
--     END CATCH;
-- END;
-- GO

-- Procedure: Update job description and create version history
-- CREATE OR ALTER PROCEDURE sp_UpdateJobDescription
--     @job_description_id INT,
--     @job_summary NVARCHAR(MAX),
--     @user_id INT,
--     @new_job_description_id INT OUTPUT
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     DECLARE @current_version INT;
--     DECLARE @new_version INT;
--     DECLARE @job_id INT;
--     DECLARE @old_summary NVARCHAR(MAX);
--     DECLARE @original_summary NVARCHAR(MAX);
    
--     BEGIN TRY
--         BEGIN TRANSACTION;
        
--         -- Get current version and job info
--         SELECT @current_version = version, @job_id = job_id, @old_summary = job_summary, @original_summary = original_job_summary
--         FROM job_descriptions 
--         WHERE id = @job_description_id;
        
--         -- Calculate new version
--         SET @new_version = @current_version + 1;
        
--         -- Mark current version as inactive
--         UPDATE job_descriptions 
--         SET is_active = 0 
--         WHERE id = @job_description_id;
        
--         -- Create new version
--         INSERT INTO job_descriptions (job_id, job_summary, original_job_summary, last_edited_by_id, version)
--         VALUES (@job_id, @job_summary, @original_summary, @user_id, @new_version);
        
--         SET @new_job_description_id = SCOPE_IDENTITY();
        
--         -- Log the change
--         INSERT INTO job_description_changes (job_description_id, change_type, field_name, old_value, new_value, user_id)
--         VALUES (@new_job_description_id, 'update', 'job_summary', @old_summary, @job_summary, @user_id);
        
--         -- Update job last_updated
--         UPDATE jobs SET last_updated = GETDATE() WHERE id = @job_id;
        
--         -- Log audit entry
--         INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
--         VALUES (@user_id, 'UPDATE', 'job_description', @new_job_description_id, 
--                 '{"version":' + CAST(@new_version AS NVARCHAR(10)) + '}');
        
--         COMMIT TRANSACTION;
        
--     END TRYs
--     BEGIN CATCH
--         ROLLBACK TRANSACTION;
--         THROW;
--     END CATCH;
-- END;
-- GO

-- Procedure: Reorder essential functions
CREATE OR ALTER  PROCEDURE [dbo].[sp_ReorderEssentialFunctions]
    @job_description_id INT,
    @function_ids NVARCHAR(MAX), -- Comma-separated list of function IDs
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @function_id INT;
    DECLARE @new_order INT = 1;
    DECLARE @pos INT;
    DECLARE @remaining NVARCHAR(MAX) = @function_ids;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Parse comma-separated function IDs and update sort orders
        WHILE LEN(@remaining) > 0
        BEGIN
            SET @pos = CHARINDEX(',', @remaining);
            IF @pos = 0
            BEGIN
                SET @function_id = CAST(@remaining AS INT);
                SET @remaining = '';
            END
            ELSE
            BEGIN
                SET @function_id = CAST(LEFT(@remaining, @pos - 1) AS INT);
                SET @remaining = SUBSTRING(@remaining, @pos + 1, LEN(@remaining));
            END
            
            UPDATE essential_functions 
            SET sort_order = @new_order, updated_at = GETDATE()
            WHERE id = @function_id AND job_description_id = @job_description_id;
            
            SET @new_order = @new_order + 1;
        END;
        
        -- Log audit entry
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
        VALUES (@user_id, 'REORDER', 'essential_functions', @job_description_id, 
                '{"function_ids":"' + @function_ids + '"}');
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_SearchJobs]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Search jobs with filters
CREATE OR ALTER  PROCEDURE [dbo].[sp_SearchJobs]
    @search_term NVARCHAR(255) = NULL,
    @job_family_id INT = NULL,
    @status NVARCHAR(50) = NULL,
    @reviewer_id INT = NULL,
    @page INT = 1,
    @limit INT = 10,
    @sortField NVARCHAR(50) = NULL,
    @sortOrder NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@page - 1) * @limit;

    -- Set default sort field if not provided
    IF @sortField IS NULL OR @sortField = ''
        SET @sortField = 'last_updated';

    -- Pre-aggregate distinct reviewer names
    WITH ReviewerNames AS (
        SELECT DISTINCT jrev.job_id, u1.name
        FROM job_reviewers jrev
        INNER JOIN people u1 ON jrev.user_id = u1.id
    )
    
    SELECT 
        j.id,
        j.job_code,
        j.job_title,
        jf.job_family, 
        rn.reviewer_name,
        j.status,
        FORMAT(j.last_updated, 'MMMM dd, yyyy') AS last_updated,
        FORMAT(j.created_at, 'MMMM dd, yyyy') AS created_at,
        COUNT(*) OVER() AS total_count
    FROM jobs j
    LEFT JOIN job_families jf ON j.job_family_id = jf.id
    LEFT JOIN (
        SELECT job_id, STRING_AGG(name, ', ') AS reviewer_name
        FROM ReviewerNames
        GROUP BY job_id
    ) rn ON rn.job_id = j.id
    WHERE 
        (@search_term IS NULL OR 
         j.job_code LIKE '%' + @search_term + '%' OR 
         j.job_title LIKE '%' + @search_term + '%' OR
         rn.reviewer_name LIKE '%' + @search_term + '%' OR
         jf.job_family LIKE '%' + @search_term + '%')
    AND (@job_family_id IS NULL OR j.job_family_id = @job_family_id)
    AND (@status IS NULL OR j.status = @status)
    AND (
        @reviewer_id IS NULL 
        OR EXISTS (
            SELECT 1 FROM job_reviewers jr 
            WHERE jr.job_id = j.id AND jr.user_id = @reviewer_id
        )
    )
    ORDER BY
        CASE WHEN @sortField = 'job_code'         AND @sortOrder = 'asc'  THEN j.job_code     END ASC,
        CASE WHEN @sortField = 'job_code'         AND @sortOrder = 'desc' THEN j.job_code     END DESC,
        CASE WHEN @sortField = 'job_title'        AND @sortOrder = 'ASC'  THEN j.job_title    END ASC,
        CASE WHEN @sortField = 'job_title'        AND @sortOrder = 'DESC' THEN j.job_title    END DESC,
        CASE WHEN @sortField = 'job_family'       AND @sortOrder = 'ASC'  THEN jf.job_family  END ASC,
        CASE WHEN @sortField = 'job_family'       AND @sortOrder = 'DESC' THEN jf.job_family  END DESC,
        CASE WHEN @sortField = 'status'           AND @sortOrder = 'ASC'  THEN j.status       END ASC,
        CASE WHEN @sortField = 'status'           AND @sortOrder = 'DESC' THEN j.status       END DESC,
        CASE WHEN @sortField = 'last_updated'     AND @sortOrder = 'ASC'  THEN j.last_updated END ASC,
        CASE WHEN @sortField = 'last_updated'     AND @sortOrder = 'DESC' THEN j.last_updated END DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateJobStatus]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Update job status with notification
CREATE OR ALTER  PROCEDURE [dbo].[sp_UpdateJobStatus]
    @job_id INT,
    @new_status NVARCHAR(50),
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @old_status NVARCHAR(50);
    DECLARE @job_code NVARCHAR(50);
    DECLARE @job_title NVARCHAR(255);
    DECLARE @reviewer_id INT;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Get current job info
        SELECT @old_status = status, @job_code = job_code, @job_title = job_title, 
               @reviewer_id = reviewer_id
        FROM jobs WHERE id = @job_id;
        
        -- Update job status
        UPDATE jobs 
        SET status = @new_status, last_updated = GETDATE()
        WHERE id = @job_id;
        
        -- Create notifications based on status change
        IF @new_status = 'Submitted to HR'
        BEGIN
            -- Notify HR team
            INSERT INTO notifications (user_id, title, message, type, category, priority)
            SELECT u.id, 'Job Submitted for HR Review', 
                   'Job ' + @job_code + ' (' + @job_title + ') has been submitted for HR review',
                   'info', 'job_status', 'medium'
            FROM users u 
            WHERE u.role = 'HR Manager' AND u.status = 'Active';
        END;
        
        IF @new_status = 'Completed'
        BEGIN
            -- Notify reviewer person
            IF @reviewer_id IS NOT NULL
            BEGIN
                INSERT INTO notifications (user_id, title, message, type, category, priority)
                VALUES (@reviewer_id, 'Job Completed', 
                       'Job ' + @job_code + ' (' + @job_title + ') has been completed',
                       'success', 'job_status', 'medium');
            END;
            
        END;
        
        -- Log audit entry
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
        VALUES (@user_id, 'STATUS_CHANGE', 'job', @job_id, 
                '{"old_status":"' + @old_status + '","new_status":"' + @new_status + '"}');
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateNotificationSettings]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Update Notification Settings
CREATE OR ALTER  PROCEDURE [dbo].[sp_UpdateNotificationSettings]
    @email_notifications BIT,
    @job_updates BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE notification_settings
    SET
        email_notifications = @email_notifications,
        job_updates = @job_updates,
        updated_at = GETDATE()
    WHERE id = (SELECT TOP 1 id FROM notification_settings ORDER BY id ASC);
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateNotificationStatus]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Update notification status
CREATE OR ALTER  PROCEDURE [dbo].[sp_UpdateNotificationStatus]
	@action varchar(10) = 'update',
    @notification_id INT,
	@status bit = 1
AS
BEGIN
    SET NOCOUNT ON;

	IF(@action = 'update')
	BEGIN
		UPDATE notifications 
		SET is_read = @status, updated_at = GETDATE()
		WHERE id = @notification_id;
    END

	IF(@action = 'delete')
	BEGIN
		DELETE notifications WHERE id = @notification_id;
	END

	IF(@action = 'bulk')
	BEGIN
		UPDATE notifications 
		SET is_read = @status, updated_at = GETDATE()
		--WHERE user_id = @notification_id;
    END

    SELECT @@ROWCOUNT AS rows_affected;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateUser]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- sp_UpdateUser
CREATE OR ALTER  PROCEDURE [dbo].[sp_UpdateUser]
    @userId INT,
    @name NVARCHAR(100),
    @email NVARCHAR(100),
	@password NVARCHAR(100),
    @role NVARCHAR(50),
    @department NVARCHAR(100),
    @status NVARCHAR(50)
AS
BEGIN
    UPDATE Users
    SET 
        name = @name,
        email = @email,
		password = @password,
        role = @role,
        department = @department,
        status = @status
    WHERE id = @userId;
    
    IF @@ROWCOUNT > 0
    BEGIN
        SELECT 
            id, 
            name, 
            email, 
            role, 
            department, 
            status, 
            last_login
        FROM Users
        WHERE id = @userId;
    END
END
GO
/****** Object:  StoredProcedure [dbo].[usp_SignInOrSignUpUser]    Script Date: 6/20/2025 3:25:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Sign in or sign up user
CREATE OR ALTER  PROCEDURE [dbo].[usp_SignInOrSignUpUser]
    @Action NVARCHAR(10),         -- 'signup' or 'signin'
    @Name NVARCHAR(255) = NULL,
    @Email NVARCHAR(255),
    @Password NVARCHAR(255),
    @Department NVARCHAR(255) = NULL,
    @Status NVARCHAR(20) = 'Active',
    @Role NVARCHAR(50) = 'Reviewer'  -- Will be overridden if department is HR
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentDateTime DATETIME2 = SYSDATETIME();
    DECLARE @IsHRLeader BIT = 0;

    -- Determine role and HR flag based on department
    IF @Department = 'Human Resources'
    BEGIN
        SET @Role = 'HR Manager';
        SET @IsHRLeader = 1;
    END

    IF @Action = 'signup'
    BEGIN
        -- Check if user already exists
        IF EXISTS (SELECT 1 FROM dbo.users WHERE email = @Email)
        BEGIN
            SELECT 'exists' AS Message;
            RETURN;
        END

        -- Insert new user
        INSERT INTO dbo.users (
            name, email, password, role, department, status,
            last_login, created_at, updated_at, IsHRLeader
        )
        VALUES (
            @Name, @Email, @Password, @Role, @Department, ISNULL(@Status, 'Active'),
            NULL, @CurrentDateTime, @CurrentDateTime, @IsHRLeader
        );

        SELECT 'success' AS Message;
    END
    ELSE IF @Action = 'login'
    BEGIN
        -- Validate email and password
        IF NOT EXISTS (
            SELECT 1 FROM dbo.users 
            WHERE email = @Email AND password = @Password
        )
        BEGIN
            SELECT 'invalid' AS Message;
            RETURN;
        END

        -- Update last login
        UPDATE dbo.users
        SET last_login = @CurrentDateTime,
            updated_at = @CurrentDateTime
        WHERE email = @Email;
		
		SELECT (
			SELECT
                id,
				name, 
				email, 
				role, 
                IsHRLeader,
				department, 
				last_login
			FROM dbo.users
			WHERE email = @Email
			FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
		) AS result;
    END
END
GO
/****** Object:  StoredProcedure [dbo].[sp_GetCompletedJobs]    Script Date: 6/25/2025 4:02:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedure: Get Completed Jobs Details
CREATE OR ALTER PROC [dbo].[sp_GetCompletedJobs]
AS
BEGIN
	SET NOCOUNT ON
	SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

	DROP TABLE IF EXISTS #tmp
	DROP TABLE IF EXISTS #tmpRev

	CREATE TABLE #tmpEF
	(
		JobID INT,
		FuncText NVARCHAR(MAX)
	)

	CREATE TABLE #tmpRev
	(
		JobID INT,
		RevNames NVARCHAR(MAX)
	)

	INSERT INTO #tmpEF
	SELECT 
		Job_Id,
		CONCAT('•', STRING_AGG(Function_Text, '\n•')) AS EssentialFunctions
	FROM Essential_Functions_Changes EF
		INNER JOIN Jobs J
			ON EF.Job_Id = J.Id AND J.Status = 'Completed'
	GROUP BY Job_ID

	INSERT INTO #tmpRev
	SELECT 
		JR.Job_Id,
		CONCAT('•', STRING_AGG(Name, '\n•')) AS Reviewers
	FROM People U
		INNER JOIN Job_Reviewers JR
			ON JR.User_Id = U.Id
		INNER JOIN Jobs J
			ON JR.Job_Id = J.Id AND J.Status = 'Completed'
	GROUP BY Job_ID

	SELECT J.Id,
		   J.Job_Title,
		   J.Job_Code,
		   JF.Job_Family,
		   'Completed' AS Status,
		   ISNULL(U.Name, 'N/A') AS LastEditedBy,
		   FORMAT(J.Last_Updated, 'MMMM d, yyyy') AS Last_Updated,
		   ISNULL(JD.Job_Summary_Changes, 'No Changes Found') AS JobSummary,
		   ISNULL(EF.FuncText, 'N/A') AS EssentialFunctions,
		   ISNULL(Rev.RevNames, 'N/A') AS Reviewers,
           JD.comments AS Comments,
           CASE WHEN JD.is_critical = 1 THEN 'Yes' ELSE 'No' END AS [Critical]
	FROM Jobs J
		LEFT JOIN Job_Families JF
			ON JF.Id = J.Job_Family_Id
		LEFT JOIN Job_Descriptions JD
			ON JD.Job_Id = J.Id
		LEFT JOIN People U
			ON U.Id = J.Reviewer_Id
		LEFT JOIN #tmpEF EF
			ON EF.JobID = J.Id
		LEFT JOIN #tmpRev Rev
			ON Rev.JobID = J.Id
	WHERE J.Status = 'Completed'
	ORDER BY J.Last_Updated DESC

	DROP TABLE #tmpEF
	DROP TABLE #tmpRev

END;
GO