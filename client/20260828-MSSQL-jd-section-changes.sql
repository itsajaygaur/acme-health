/*
  Reviewer edits to the editable Acme Health JD elements.

  Education DESIRED, Experience DESIRED and Certification Registration_Licensure
  DESIRED can be edited by Functional Leaders on the Updated panel. The original
  values are parsed from job_descriptions.other_job_description, which stays
  untouched so the Original panel keeps showing the unedited job description.

  section_key matches a key of JobDescriptionSections in
  shared/job-description-fields.ts (e.g. 'educationDesired').

  sort_order >= 0 is a displayed item, in order. A single row with
  sort_order = -1 and an empty item_text marks a section the reviewer has
  deliberately emptied: without it, "saved with no items" and "never edited"
  would both read as "no rows" and deleted items would reappear on reload.
*/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF object_id('jd_section_changes', 'U') is not null
	DROP TABLE [jd_section_changes]
GO

CREATE TABLE [dbo].[jd_section_changes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[job_id] [int] NOT NULL,
	[section_key] [nvarchar](64) NOT NULL,
	[item_text] [nvarchar](max) NOT NULL,
	[sort_order] [int] NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_jd_section_changes] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[jd_section_changes] ADD DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[jd_section_changes] ADD DEFAULT (sysdatetime()) FOR [updated_at]
GO

CREATE NONCLUSTERED INDEX [IX_jd_section_changes_job_id]
	ON [dbo].[jd_section_changes] ([job_id] ASC, [section_key] ASC, [sort_order] ASC)
GO
