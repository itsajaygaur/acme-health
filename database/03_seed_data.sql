/* =========================================================================
   Acme Health — seed data
   =========================================================================
   GENERATED FILE — do not edit by hand.
   Regenerate with:  node scripts/seed-from-excel.mjs
   Source: database/source/Total_Rewards_sample_data_file.xlsx

   Run after 01_tables.sql and 02_procedures.sql. Refuses to run twice:
   the guard below skips the rest of the file if dbo.jobs already has rows.

   Ids are written explicitly so job_descriptions.id can be kept equal to
   job_descriptions.job_id, which is what makes the app's
   'UPDATE job_descriptions ... WHERE id = @jobId' address the right row.
   ========================================================================= */

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/* Severity 10 so this reports without raising an error: an error here would
   abort the batch before SET NOEXEC ON could take effect, and the seed would
   run anyway. */
IF EXISTS (SELECT 1 FROM dbo.jobs)
BEGIN
    RAISERROR('dbo.jobs is not empty - seed skipped. Clear the tables first if you meant to re-seed.', 10, 1) WITH NOWAIT;
    SET NOEXEC ON;
END
GO

BEGIN TRY
BEGIN TRANSACTION;

/* ---------------------------------------------------------- job_families */
SET IDENTITY_INSERT dbo.job_families ON;
INSERT INTO dbo.job_families (id, job_family) VALUES
    (1, N'Human Resources');
SET IDENTITY_INSERT dbo.job_families OFF;

/* ------------------------------------------------------------------ jobs */
/* Every job starts at 'Not Started' with no reviewer: the workbook carries
   no review state. */
SET IDENTITY_INSERT dbo.jobs ON;
INSERT INTO dbo.jobs (id, job_code, job_title, job_family_id, job_function, career_stage, career_level_name, career_level, status) VALUES
    (1, N'2118', N'Benefits Analyst Senior', 1, N'Total Rewards', N'Professional', N'Senior', N'P3', N'Not Started'),
    (2, N'447', N'Benefits Education Specialist', 1, N'Total Rewards', N'Professional', N'Intermediate', N'P2', N'Not Started'),
    (3, N'261', N'Benefits Representative', 1, N'Total Rewards', N'Support', N'Intermediate', N'S2', N'Not Started'),
    (4, N'5003', N'Benefits Specialist', 1, N'Total Rewards', N'Professional', N'Intermediate', N'P2', N'Not Started'),
    (5, N'278', N'Benefits Specialist Senior', 1, N'Total Rewards', N'Professional', N'Senior', N'P3', N'Not Started'),
    (6, N'2250', N'Compensation Analyst', 1, N'Total Rewards', N'Professional', N'Intermediate', N'P2', N'Not Started'),
    (7, N'2676', N'Compensation Analyst Senior', 1, N'Total Rewards', N'Professional', N'Senior', N'P3', N'Not Started'),
    (8, N'1353', N'Director, Benefits', 1, N'Total Rewards', N'Leadership', N'Director', N'L1', N'Not Started'),
    (9, N'1352', N'Director, Compensation', 1, N'Total Rewards', N'Leadership', N'Director', N'L1', N'Not Started'),
    (10, N'5005', N'Leave Benefits Coordinator', 1, N'Total Rewards', N'Support', N'Intermediate', N'S2', N'Not Started'),
    (11, N'5006', N'Leave Benefits Specialist', 1, N'Total Rewards', N'Professional', N'Intermediate', N'P2', N'Not Started'),
    (12, N'2201', N'Leave Program Specialist', 1, N'Total Rewards', N'Professional', N'Senior', N'P3', N'Not Started'),
    (13, N'1322', N'Manager, Benefits', 1, N'Total Rewards', N'Management', N'Manager', N'M2', N'Not Started'),
    (14, N'1183', N'Manager, Compensation', 1, N'Total Rewards', N'Management', N'Manager', N'M2', N'Not Started'),
    (15, N'1213', N'Manager, Payroll', 1, N'Total Rewards', N'Management', N'Manager', N'M2', N'Not Started'),
    (16, N'1192', N'Manager, Physician Compensation', 1, N'Total Rewards', N'Management', N'Manager', N'M2', N'Not Started'),
    (17, N'1371', N'Manager, Retirement', 1, N'Total Rewards', N'Management', N'Manager', N'M2', N'Not Started'),
    (18, N'2286', N'Payroll Analyst Consultant', 1, N'Total Rewards', N'Professional', N'Consultant/Lead', N'P4', N'Not Started'),
    (19, N'5048', N'Payroll Specialist', 1, N'Total Rewards', N'Professional', N'Intermediate', N'P2', N'Not Started'),
    (20, N'5051', N'Payroll Specialist Senior', 1, N'Total Rewards', N'Professional', N'Senior', N'P3', N'Not Started'),
    (21, N'2595', N'Physician Compensation Analyst', 1, N'Total Rewards', N'Professional', N'Intermediate', N'P2', N'Not Started'),
    (22, N'2677', N'Physician Compensation Analyst Senior', 1, N'Total Rewards', N'Professional', N'Senior', N'P3', N'Not Started'),
    (23, N'2699', N'Physician Compensation Solutions Consultant', 1, N'Total Rewards', N'Professional', N'Consultant/Lead', N'P4', N'Not Started'),
    (24, N'2451', N'Retirement Benefit Specialist Senior', 1, N'Total Rewards', N'Professional', N'Senior', N'P3', N'Not Started'),
    (25, N'2864', N'Supervisor, Leave Benefits Administrator', 1, N'Total Rewards', N'Management', N'Supervisor', N'M1', N'Not Started'),
    (26, N'1273', N'Supervisor, Payroll', 1, N'Total Rewards', N'Management', N'Supervisor', N'M1', N'Not Started'),
    (27, N'1931', N'Vice President, Total Rewards', 1, N'Total Rewards', N'Executive', N'Vice President', N'E1', N'Not Started');
SET IDENTITY_INSERT dbo.jobs OFF;

/* ------------------------------------------------------ job_code_mappings */
/* The legacy per-region codes and pre-merger titles. */
INSERT INTO dbo.job_code_mappings (job_id, region, legacy_job_code, current_job_title) VALUES
    (1, N'Gundersen', N'2118', N'Senior Benefits Analyst'),
    (1, N'Bellin', N'2118', N'Senior Benefits Analyst'),
    (2, N'Bellin', N'447', N'Benefits Education Specialist'),
    (3, N'Bellin', N'261', N'Benefits Support Specialist'),
    (4, N'Gundersen', N'5003', N'Benefits Specialist'),
    (4, N'Bellin', N'118', N'Benefits Specialist'),
    (5, N'Bellin', N'278', N'Sr. Benefits Specialist'),
    (6, N'Gundersen', N'2250', N'Compensation Analyst'),
    (6, N'Bellin', N'138', N'Compensation Analyst'),
    (7, N'Gundersen', N'2676', N'Compensation Consultant'),
    (7, N'Bellin', N'2676', N'Compensation Consultant'),
    (8, N'Gundersen', N'1353', N'Director, Benefits'),
    (8, N'Bellin', N'1353', N'Director, Benefits'),
    (9, N'Gundersen', N'1352', N'Director, Compensation'),
    (9, N'Bellin', N'1352', N'Director, Compensation'),
    (10, N'Gundersen', N'5005', N'Leave Benefits Coordinator'),
    (10, N'Bellin', N'448', N'Leave Benefits Coordinator'),
    (11, N'Gundersen', N'5006', N'Leave Benefits Specialist'),
    (11, N'Bellin', N'449', N'Leave Benefits Specialist'),
    (12, N'Gundersen', N'2201', N'Leave Program Specialist'),
    (12, N'Bellin', N'2201', N'Leave Program Specialist'),
    (13, N'Gundersen', N'1322', N'Manager, Benefits'),
    (13, N'Bellin', N'1322', N'Manager, Benefits'),
    (14, N'Gundersen', N'1183', N'Manager, Compensation'),
    (14, N'Bellin', N'1183', N'Manager, Compensation'),
    (15, N'Gundersen', N'1213', N'Manager, Payroll'),
    (16, N'Gundersen', N'1192', N'Manager, Physician Compensation'),
    (17, N'Gundersen', N'1371', N'Manager, Retirement'),
    (17, N'Bellin', N'1371', N'Manager, Retirement'),
    (18, N'Gundersen', N'2286', N'Payroll Solutions Consultant'),
    (19, N'Gundersen', N'5048', N'Payroll Specialist'),
    (20, N'Gundersen', N'5051', N'Sr Payroll Analyst'),
    (21, N'Gundersen', N'2595', N'Physician Compensation Data Analyst'),
    (22, N'Gundersen', N'2677', N'Physician Compensation Consultant'),
    (23, N'Gundersen', N'2699', N'Physician Compensation Solutions Consultant'),
    (24, N'Gundersen', N'2451', N'Senior Retirement Benefit Specialist'),
    (24, N'Bellin', N'2451', N'Senior Retirement Benefit Specialist'),
    (25, N'Bellin', N'2864', N'Supervisor, Leave Benefits Administrator'),
    (26, N'Gundersen', N'1273', N'Supervisor, Payroll'),
    (27, N'Gundersen', N'1931', N'Vice President, Total Rewards'),
    (27, N'Bellin', N'1931', N'Vice President, Total Rewards');

/* ----------------------------------------------------- job_descriptions */
INSERT INTO dbo.job_descriptions (id, job_id, job_summary_original, job_summary_ai, other_job_description, other_job_description_ai, last_updated_date) VALUES
    (1, 1, N'This position will do the following: Coordinates the administration of employee benefits programs including health and welfare, PTO, retirement, and other total rewards and assures compliance with all applicable state and federal regulation. Responsibilities include leading ongoing department communication and education relating to benefit offering and makes recommendations on how to improve plan design based on employee utilization and feedback and market trends. Compiles, analyzes, and reports data including employee, plan financials for strategic benefits planning and evaluation. Provides benefit plan interpretation, guidance, and counsel to employees, HRIS representatives, and managers. Presents information to inform and educate management. Serves as a liaison with service providers in business planning and benefit program interpretation, facilitates vendor management. The Senior Benefits Analyst will report to the Manager of Benefits.', N'Coordinates the administration of employee benefits programs including health and welfare, paid time off, retirement, and other total rewards while ensuring compliance with applicable state and federal regulations. This position leads ongoing communication and education efforts related to benefit offerings and recommends improvements to plan design based on employee utilization, feedback, and market trends. In addition, this position compiles, analyzes, and reports data on employee and plan financials to support strategic benefits planning and evaluation. Additionally, this role provides benefit plan interpretation, guidance, and counsel to employees, HRIS representatives, and managers, and presents information to inform and educate management. Serves as a liaison with service providers to facilitate vendor management and support business planning and benefit program interpretation.', N'Education
• Bachelor''s degree in Business or a related field Required
Experience
• 3-4 years of total rewards, employee benefits, human resources or related experience Required
• 4-6 years of total rewards, employee benefits, human resources or related experience Preferred
Certification Registration_Licensure
• Certified Employee Benefits Specialist (CEBS) certification Preferred
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', N'Education
• Bachelor’s degree in Business or a related field of study Required
Experience
• 3 years of experience in total rewards, employee benefits, human resources or related experience Required
• 4 years of experience in total rewards, employee benefits, human resources or related experience Preferred
Certification Registration_Licensure
• CEBS – Certified Employee Benefit Specialist Preferred
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', SYSDATETIME()),
    (2, 2, N'The Employee Benefit Education Specialist plays a vital role in supporting clinician candidates and current employees by providing expert guidance and education on employee benefits. This role focuses on connecting with clinician candidates during the recruitment process to ensure a smooth onboarding experience from a benefits perspective. Additionally, the specialist will work closely with employees approaching retirement to discuss their individual scenarios, benefits options, and available resources to support their transition.', N'Provides expert guidance and education on employee benefits to support clinician candidates and current employees. This position facilitates a smooth onboarding experience by connecting with clinician candidates during recruitment and assists employees approaching retirement by discussing individual scenarios, benefits options, and available resources. Responsibilities for this role include educating employees on benefits programs, addressing inquiries, and collaborating with recruitment and retirement planning teams. Additionally, this role monitors benefits communication effectiveness and updates educational materials to ensure clarity and compliance. Contributes to employee satisfaction and retention by enhancing understanding and utilization of benefits throughout the employment lifecycle.', N'Education
• Associate''s degree in Human Resources, Communications, or related field Required
Experience
• 3-4 years’ of employee benefit experience or 5-7 years of experience in HR with progressive accountabilities Required
• Experience working in healthcare or clinical settings and/or communications experience; Proven experience in employee benefits education, counseling, or related HR functions Preferred
Certification Registration_Licensure
• Certification in benefits or retirement planning (e.g., CEBS, CRC) Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', N'Education
• Associate''s degree in Human Resources, Communications, or related field Required
Experience
• 3 years of experience in employee benefits or Required
• 5 years of experience in HR with progressive accountabilities Required
• Experience in healthcare or clinical settings Preferred
• Experience in communications Preferred
• Experience in employee benefits education, counseling, or related HR functions Preferred
Certification Registration_Licensure
• CEBS – Certified Employee Benefit Specialist, CRC – Certified Retirement Counselor Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', SYSDATETIME()),
    (3, 3, N'Responsible for providing technical and administrative support of benefits to Bellin Health employees.', N'Provides technical and administrative support for employee benefits within the healthcare system. This position administers benefits programs, processes enrollments and changes, and responds to employee inquiries regarding benefits. In addition, this position maintains accurate benefits records, ensures compliance with policies and regulations, and collaborates with internal teams to resolve benefits-related issues. Additionally, this role assists in benefits communication and education efforts to enhance employee understanding. Responsibilities for this role include supporting benefits administration, managing data accuracy, and contributing to the overall efficiency of benefits operations.', N'Education
• Associate degree with one to two years of experience with progressive accountabilities (preferably in benefits area) or Bachelor’s degree with one to two years of experience with progressive accountabilities (preferably in benefits area) Required
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', N'Education
• Bachelor''s degree or equivalent years of experience and education. Required
Experience
• 1 year of experience in related field (preferably benefits) Required
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', SYSDATETIME()),
    (4, 4, N'Coordinates administration of employee benefit programs such as health and dental coverage, group life insurance, disability insurance, and qualified and voluntary benefit plans. Consults with and advises employees on eligibility, coverage, cost, and other matters related to benefits. Maintains benefits records and documents. Assists in the preparation of employee benefits booklets and other employee benefit communication.', N'Administers and coordinates employee benefit programs by developing, implementing, and communicating health, dental, life, disability, and voluntary benefit plans. This position manages benefit plan funding analysis, billing review, auditing, and reconciliation to ensure accuracy and compliance. In addition, this position maintains benefit records, advises employees on eligibility and coverage, and prepares communication materials. Additionally, this role collaborates with internal teams and external vendors to resolve issues and uphold benefit plan integrity. Responsibilities for this role include managing benefit administration, providing employee consultation, maintaining documentation, and supporting organizational goals through effective benefits management.', N'Education
• Associate degree in Business Administration or Human Resources Required
Experience
• 3-4 years experience in Human Resources or 3 years relevant work experience Required
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', N'Education
• Bachelor''s degree or equivalent years of experience and education. Required
Experience
• 3 years of experience in Human Resources Required
• 3 years of applicable experience Required
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', SYSDATETIME()),
    (5, 5, NULL, NULL, NULL, NULL, SYSDATETIME()),
    (6, 6, N'The Analyst assists in the research, development and implementation of employee compensation programs. Researches legislative and regulatory guidelines applicable to our current (and potential) employee compensation offerings. Assists with financial and operational cost analyses for these programs. Compiles and maintains departmental documentation relating to compensation program processes and procedures.', N'Assists in the research, development, and implementation of employee compensation programs to ensure competitive and compliant offerings. This position analyzes legislative and regulatory guidelines applicable to current and potential compensation plans. In addition, this position conducts financial and operational cost analyses to support program effectiveness and sustainability. Additionally, this role compiles and maintains documentation related to compensation program processes and procedures. Responsibilities for this role include collaborating with cross-functional teams to align compensation strategies with organizational goals and contributing to the continuous improvement of compensation practices.', N'Education
• Bachelor’s degree in a business related field or Human Resources or Finance or Accounting.; Note: Employees hired in the Compensation Analyst role prior to December 1,2024 are exempt from the educational requirement.; Relevant professional experience is considered applicable Required
Experience
• Two years Human Resources or Compensation experience Required
Certification Registration_Licensure
• CCP Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', N'Education
• Bachelor’s degree in business related field or Human Resources or Finance or Accounting Required
Experience
• 2 years of experience in Human Resources  or Required
• 2 years of experience in Compensation Required
Certification Registration_Licensure
• CCP – Certified Compensation Professional Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', SYSDATETIME()),
    (7, 7, N'The Compensation Consultant partners with HR Business Partners and leadership across the organization in the area of compensation program evaluation and design. Responsible for research and modeling of programs and practices to ensure more proactive solutions to meet business needs. Performs complex, analytical modeling in order to make data driven recommendations on our various compensation programs. Consults with and provides guidance and resolution to the Compensation team, Human Resources team members and leaders at all levels of the organization related to compensation needs. Serves as the project lead on major compensation projects. Drives enterprise pay strategies.', N'Leads the evaluation, design, and administration of compensation programs to align with business needs and organizational objectives. This position conducts research and performs complex analytical modeling to develop data-driven recommendations for compensation strategies. In addition, this position consults with Compensation and Human Resources teams and organizational leaders to provide guidance and resolve compensation-related issues. Additionally, this role manages timelines and communication plans for compensation programs and leads major compensation projects. Responsibilities for this role include program evaluation, strategic planning, consultation, project leadership, and ensuring alignment of compensation strategies with enterprise goals.', N'Education
• Bachelor’s degree in Human Resources or other business-related field. Required
Experience
• 5+ years of progressive experience in Compensation including design of compensation structures and processes. Required
• Experience using Workday and/or Infor Preferred
• Healthcare industry experience preferred. Preferred
Certification Registration_Licensure
• Certified Compensation Professional (CCP) Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - – approximately 8 hours in a day
• Static Standing - – approximately 3 hours total in a day (if use standing desk)
• Walking/Standing - – approximately 30 minutes to 1.5 hours total in a day Reaching – Shoulder Level – approximately 30 minutes to 1.5 hours total in a day Repetitive Actions – Fine manipulation – 0-25lbs
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', N'Education
• Bachelor’s degree in Human Resources or other business-related field Required
Experience
• 5 years of experience in Compensation Required
• 5 years of experience in design of compensation structures and processes Required
• Experience using Workday and/or Infor Preferred
• Experience in healthcare industry Preferred
Certification Registration_Licensure
• CCP – Certified Compensation Professional Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - – approximately 8 hours in a day
• Static Standing - – approximately 3 hours total in a day (if use standing desk)
• Walking/Standing - – approximately 30 minutes to 1.5 hours total in a day Reaching – Shoulder Level – approximately 30 minutes to 1.5 hours total in a day Repetitive Actions – Fine manipulation – 0-25lbs
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', SYSDATETIME()),
    (8, 8, N'As the Director of Benefits, you are responsible for providing leadership in developing benefits strategy, design and execution to support the organizations’ overall strategies. In this role you are responsible for health and welfare, retirement, leave and time off benefit plans and programs, including regulatory compliance. You will play a key role in continuously assessing outcomes and driving enhancements that advance our Total Rewards Strategy.

Reporting to the Vice President of Total Rewards, the Director of Benefits partners with HR, leadership, operations and finance to design competitive, compliant plans and programs that are sustainable and meet the needs of our workforce.

To be successful in this role, the Director must possess deep technical expertise in benefits, strong financial acumen, communications and people leadership experience, along with a commitment to accountability. They must be a proven strategic thinker capable of leading change at the operational and strategic levels. They must be highly motivated, committed to the development of their team, have a passion for designing high-quality and innovative benefits solutions, and have a deep interest in building collaborative cross-functional relationships. Decision-making skills must be decisive yet grounded in flexibility and practicality, and data-driven curiosity.', N'Provides leadership in developing and executing benefits strategy, design, and administration to support organizational goals. This position directs health and welfare, retirement, leave, and time off benefit plans and programs, ensuring regulatory compliance. In addition, this position partners with human resources, leadership, operations, and finance to design competitive, compliant, and sustainable benefits solutions. Additionally, this role assesses outcomes and drives enhancements that advance the Total Rewards Strategy. Contributes to organizational success by fostering innovative benefits programs and building collaborative cross-functional relationships.', N'Education
• Bachelor Required
• master’s or advanced degrees Preferred
Experience
• 7 years of benefits, human resources, or finance experience, with a five years of benefits experience Required
• 3 years of people management, and preference for experience within healthcare industry. Preferred
Certification Registration_Licensure
• Preferred CEBS, CBP, SCP Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', N'Education
• Bachelor’s degree in related field of study Required
• Master’s in related field of study Preferred
Experience
• 7 years of experience in benefits, human resources, or finance Required
• 5 years of experience in benefits Required
• 3 years of experience in people management Preferred
• Preference for experience in healthcare industry Preferred
Certification Registration_Licensure
• CBP – Certified Benefits Professional, CEBS – Certified Employee Benefit Specialist, SBP - Senior Benefits Professional Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', SYSDATETIME()),
    (9, 9, N'As the Director of Compensation, you are responsible for providing leadership in developing compensation strategy, design and execution to support the organization’s overall strategies.  In this role you are responsible for all broad-based and executive compensation programs, including regulatory compliance.  You will play a key role in continuously assessing outcomes and driving enhancements that advance our Total Rewards Strategy.

Reporting the to the Vice President Total Rewards, the Director of Compensation partners with HR, leadership, operations and finance to provide the consulting and leadership necessary to design programs and solutions that are sustainable and meet the needs of our workforce.

To be successful in this role, the Director must possess deep technical expertise in compensation, strong communications, financial acumen, and people leadership experience, along with a commitment to accountability. They must be a proven strategic thinker capable of leading change at the operational and strategic levels. They must be highly motivated, committed to the development of their team, have a passion for designing high-quality and innovative compensation solutions, and have a deep interest in building collaborative cross-functional relationships. Decision-making skills must be decisive yet grounded in flexibility and practicality, and data-driven curiosity.', N'Leads the development, design, and execution of compensation strategy to support organizational objectives. This position manages all broad-based and executive compensation programs, ensuring regulatory compliance and alignment with Total Rewards Strategy. In addition, this position partners with human resources, leadership, operations, and finance to consult on and design sustainable compensation solutions that meet workforce needs. Additionally, this role assesses program outcomes continuously and drives enhancements to improve compensation effectiveness. Contributes to organizational success by fostering cross-functional collaboration, applying financial acumen, and leading a team to deliver innovative compensation strategies.', N'Education
• Bachelor Required
• master’s or advanced degrees Preferred
Experience
• 7 years of compensation, finance or human resources experience, with a five years of compensation experience Required
• 3 years of people management, and preference for experience within healthcare industry. Preferred
Certification Registration_Licensure
• CCP, SCP Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', N'Education
• Bachelor’s degree in related field of study Required
• Master’s degree in related field of study Preferred
Experience
• 7 years of experience in compensation, finance or human resources Required
• 5 years of experience in compensation Required
• 3 years of experience in people management Preferred
• 3 years of applicable experience in healthcare industry Preferred
Certification Registration_Licensure
• CCP – Certified Compensation Professional, SCP – Senior Compensation Professional Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', SYSDATETIME()),
    (10, 10, N'The Leave Benefit Coordinator is responsible for administering and managing all aspects of leave of absence requests. This role ensures compliance with applicable laws and company policies while providing exceptional support to our Leave Benefit Specialists and employees.', N'Administers and manages all aspects of leave of absence requests to ensure compliance with applicable laws and company policies. This position coordinates leave processes, administers leave benefits, processes requests, and supports employees and Leave Benefit Specialists. In addition, this position monitors leave documentation and status, maintains accurate records, and facilitates communication between involved parties. Additionally, this role reviews leave requests for eligibility, processes approvals, collaborates with various departments to resolve related issues, and supports cross-functional teams. Responsibilities for this role include maintaining regulatory compliance, ensuring consistent application of leave policies, and contributing to effective leave management within the organization.', N'Education
• Associate degree in human resources, Business Administration or related field (or equivalent experience). Required
Experience
• Minimum 2–3 years of experience in benefits administration or leave management. Strong knowledge of FMLA, ADA, short-term and long-term disability, state leave programs, USERRA and related regulations. Excellent written and verbal communication skills. High level of proficiency in Microsoft Office Suite or similar software. Experience with HRIS systems (Workday, UKG) and HR Service Center tickets Ability to work independently in a fast-paced environment. Required
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', N'Education
• Associate’s degree in Human Resources, Business Administration, or related field of study Required
• A combination of education and experience will be considered in lieu of degree Required
Experience
• 2 years of experience in benefits administration or leave management Required
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', SYSDATETIME()),
    (11, 11, N'The Leave Benefit Specialist role manages employee leave requests, ensuring compliance with federal and state regulations (FMLA, ADA, USERRA, Pregnancy Discrimination Act, etc.) and supports employees and management throughout the leave process.', N'Manages employee leave requests to ensure compliance with federal and state regulations including FMLA, ADA, USERRA, and the Pregnancy Discrimination Act. This position coordinates leave processes and communicates requirements to employees and management. In addition, this position monitors leave documentation, tracks leave status, and maintains accurate records. Additionally, this role provides guidance on leave policies, resolves leave-related issues, and collaborates with various organizational units. Responsibilities for this role include supporting compliance efforts, facilitating smooth leave administration, and contributing to workforce stability.', N'Education
• Associate degree, preferably in Human Resources, Business Administration, or related field Required
Experience
• 3-5 years of experience in leave administration or human resources strong knowledge of FMLA, ADA, short-term and long-term disability, state leave programs, USERRA and related regulations. Required
• Experience with HRIS systems (Workday, UKG) and HR Service Center tickets Ability to work independently in a fast-paced environment. Required
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', N'Education
• Associate’s degree in Human Resources, Business Administration, or related field Required
Experience
• 3 years of experience in leave administration  or Required
• 3 years of experience in human resources Required
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', SYSDATETIME()),
    (12, 12, N'The Leave Program Specialist serves as the subject matter expert on the organization’s various paid and unpaid time away from work programs. This role is responsible for overseeing and administering leave requests, ensuring compliance with federal and state regulations, and providing support to employees and management regarding leave policies and procedures.

The Leave Program Specialist will develop, implement, and administer leave programs to assist leaders and the organization in managing absences while ensuring compliance with applicable laws. This position requires effective communication with employees regarding their leave needs, as well as the ability to interpret and administer leave programs and policies in accordance with federal and state employment laws (FMLA, ADA, USERRA, Pregnancy Discrimination Act, etc.). The Leave Program Specialist will also create policies and procedures to ensure compliance and best practices.', N'Oversees and administers paid and unpaid leave programs to ensure compliance with federal and state regulations and support organizational absence management. This position develops, implements, and manages leave programs while interpreting leave policies and communicating with employees and management regarding leave options and applicable laws such as FMLA, ADA, USERRA, and the Pregnancy Discrimination Act. In addition, this position creates and updates policies and procedures to maintain compliance and promote best practices. Additionally, this role collaborates with management and employees to facilitate leave processes and provide guidance on leave requests. Contributes to organizational effectiveness by managing leave programs that support workforce stability and regulatory adherence.', N'Education
• Bachelor’s degree in Human Resources, Business Administration, or a related field. Required
Experience
• Two to three years of experience in leave administration or human resources. Extensive knowledge of leave requirements and legal protections under FMLA, ADA, and other applicable laws. Proficient in Microsoft Office Suite or similar software. Required
• Five years of regulatory experience related to leaves of absence Preferred
Certification Registration_Licensure
• Specialized certification or training in leave administration (e.g., SHRM-CP or SHRM-SCP). Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours) Repetitive Actions – Fine manipulation Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', N'Education
• Bachelor’s degree in Human Resources, Business Administration, or a related field Required
Experience
• 2 years of experience in leave administration  or Required
• 2 years of experience in human resources Required
• 5 years of experience in regulatory experience related to leaves of absence Preferred
Certification Registration_Licensure
• SHRM-CP – Society for Human Resource Management Certified Professional, or SHRM-SCP – Society for Human Resource Management Senior Certified Professional Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours) Repetitive Actions – Fine manipulation Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', SYSDATETIME()),
    (13, 13, N'Oversees development and administration of benefit programs to ensure alignment with philosophy and guiding principles, in compliance with regulatory agencies and plan documents. Analyzes market trends and new legislative requirements for impact on current benefits. Analyzes and monitors costs/benefits associated with benefit programs. Develops and implements benefit communication and SOPs. Evaluates and monitors effectiveness of benefit programs including cost and employee engagement and satisfaction.

To be successful in this role, the Benefits Manager must possess deep technical expertise in benefits, strong financial acumen, communications and people leadership experience, along with a commitment to accountability. They must be a proven strategic thinker capable of leading change at the operational and strategic levels. They must be highly motivated, committed to the development of their team, have a passion for designing high-quality and innovative benefits solutions, and have a deep interest in building collaborative cross-functional relationships. Decision-making skills must be decisive yet grounded in flexibility and practicality, and data-driven curiosity.', N'Oversees the development and administration of benefit programs to ensure compliance with regulatory requirements and alignment with organizational principles. This position analyzes market trends and legislative changes to assess their impact on current benefits. In addition, this position monitors and evaluates the costs and effectiveness of benefit programs, including employee engagement and satisfaction. Additionally, this role develops and implements benefit communications and standard operating procedures. Collaborates across functions to design innovative benefits solutions that support organizational goals and enhance team development.', N'Education
• Bachelor’s degree Required
Experience
• 5+ years benefits experience. Required
• Healthcare, Workday and Infor Preferred
Certification Registration_Licensure
• CBP, CEBS Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', N'Education
• Bachelor’s degree in related field of study Required
Experience
• 5 years of experience in benefits experience Required
• Experience in Healthcare Preferred
• Experience in Workday Preferred
• Experience in Infor Preferred
Certification Registration_Licensure
• CBP – Certified Benefits Professional, CEBS – Certified Employee Benefit Specialist Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', SYSDATETIME()),
    (14, 14, N'Plan, coordinate, and administer compensation programs and policies to ensure the effectiveness of the total rewards strategy. Provide thought leadership and advice to create innovative solutions that align compensation policy and practice with Acme Health objectives, ensuring support for the recruitment and retention goals. Operationally execute projects and initiatives that improve delivery of enterprise compensation management. Is a subject matter expert in compensation and a willing partner to a diverse group of internal and external stakeholders. A hands-on people leader of the compensation team.', N'Plans, coordinates, and administers compensation programs and policies to ensure the effectiveness of the total rewards strategy. This position provides thought leadership and advice to create innovative solutions that align compensation policy and practice with organizational objectives, supporting recruitment and retention goals. In addition, this position operationally executes projects and initiatives that improve the delivery of enterprise compensation management. Additionally, this role serves as a subject matter expert in compensation and collaborates with diverse internal and external partners. Responsibilities for this role include leading the compensation team and driving strategic compensation management across the organization.', N'Education
• Bachelor’s degree Required
Experience
• 7+ years compensation experience. Required
• Healthcare, Workday and Infor Preferred
Certification Registration_Licensure
• CCP Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', N'Education
• Bachelor’s degree in related field of study Required
Experience
• 7 years of experience in compensation Required
• Experience in Healthcare Preferred
• Experience in Workday Preferred
• Experience in Infor Preferred
Certification Registration_Licensure
• CCP – Certified Compensation Professional Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', SYSDATETIME()),
    (15, 15, N'Responsible for the management of all payroll related functions to ensure proper set-up, processing and the generation of multiple payrolls for the organization. Ensures the computing, withholding and calculation of deductions associated with gross and net pay are done properly and in accordance with federal, state, and local regulations. Oversees the compilation and preparation of periodic reports on payroll matters as well as preparation and distribution of year-end tax forms.', N'Manages all payroll functions to ensure accurate setup, processing, and generation of multiple payrolls for the organization. This position ensures proper computation, withholding, and calculation of deductions related to gross and net pay in compliance with federal, state, and local regulations. In addition, this position oversees the compilation and preparation of periodic payroll reports and the distribution of year-end tax forms. Additionally, this role collaborates with cross-functional teams to maintain payroll accuracy and resolve related issues. Contributes to organizational compliance and financial integrity through effective payroll management and reporting.', N'Education
• Bachelor’s Accounting, Finance, Human Resources or related business area Required
Experience
• 5 years in progressive business environment within financial area or within human resources Required
• 5 years working in payroll within a progressive business environment. Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Approximately 8 hours in a day
• Static Standing -
• Walking/Standing - or
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', N'Education
• Bachelor’s in Accounting, Finance, Human Resources or related business area Required
Experience
• 5 years of experience in progressive business environment within financial area  or Required
• 5 years of experience in progressive business environment within human resources Required
• 5 years of experience in payroll Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Approximately 8 hours in a day
• Static Standing -
• Walking/Standing - or
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', SYSDATETIME()),
    (16, 16, N'Assists Executive Committee; Chief Human Resources Officer; and Director in medical staff salary administration.', N'Assists with medical staff salary administration to support organizational compensation processes. This position collaborates with executive leadership and human resources to ensure accurate and timely salary management. In addition, this position coordinates data collection, verifies salary information, and maintains confidential records. Additionally, this role supports communication between leadership and medical staff regarding compensation matters. Responsibilities for this role include facilitating salary administration tasks that contribute to effective workforce management and organizational financial planning.', N'Education
• Master''s degree in Business or Healthcare/Hospital Administration Required
Experience
• 5-7 years in health care administration; 3 years intermediate to advanced spreadsheet and database experience. Required
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', N'Education
• Master''s degree in Business or Healthcare/Hospital Administration Required
Experience
• 5 years of experience in health care administration Required
• 3 years of experience in intermediate to advanced spreadsheet and database use Required
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', SYSDATETIME()),
    (17, 17, N'Oversees development and administration of qualified and non-qualified benefit programs in compliance with regulatory agencies and plan documents. Analyzes market trends and new legislative requirements for impact on current benefits. Analyzes and monitors costs/benefits associated with benefit programs. Develops and implements retirement benefit communication plans and SOPs. Evaluates and monitors effectiveness of benefit programs including cost and employee engagement and satisfaction.

To be successful in this role, the Retirement Manager must possess deep technical expertise in benefits, strong financial acumen, communications and people leadership experience, along with a commitment to accountability. They must be a proven strategic thinker capable of leading change at the operational and strategic levels. They must be highly motivated, committed to the development of their team, have a passion for designing high-quality and innovative benefits solutions, and have a deep interest in building collaborative cross-functional relationships. Decision-making skills must be decisive yet grounded in flexibility and practicality, and data-driven curiosity.', N'Oversees the development and administration of qualified and non-qualified benefit programs ensuring compliance with regulatory agencies and plan documents. This position analyzes market trends and legislative changes to assess their impact on current benefits. In addition, this position develops and implements retirement benefit communication plans and standard operating procedures. Additionally, this role evaluates and monitors the effectiveness of benefit programs by analyzing costs, employee engagement, and satisfaction. Collaborates across functions to design innovative benefits solutions that support organizational goals and enhance employee experience.', N'Education
• Bachelor’s degree Required
Experience
• 5+ years benefits experience. Required
• Healthcare, Workday and Infor Preferred
Certification Registration_Licensure
• CBP, CEBS Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', N'Education
• Bachelor’s degree in related field of study Required
Experience
• 5 years of experience in benefits Required
• Experience in Healthcare Preferred
• Experience in Workday Preferred
• Experience in Infor Preferred
Certification Registration_Licensure
• CBP – Certified Benefits Professional, CEBS – Certified Employee Benefit Specialist Preferred
Physical Requirements/Demands of the Position
• Sitting -
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', SYSDATETIME()),
    (18, 18, N'Responsible for advancing efficiency in timekeeping and payroll operations and developing strategies built on data analytics that align to enterprise human resource process transformation objectives. Collaborates with key partners in HR technology, people analytics, HR Service Center, and other functions within the HR operating model to drive improvement in delivery of timekeeping and payroll.', N'Advances efficiency in timekeeping and payroll operations by developing strategies based on data analytics that support enterprise human resource process transformation objectives. This position collaborates with partners in HR technology, people analytics, HR Service Center, and other HR functions to enhance timekeeping and payroll delivery. In addition, this position analyzes payroll data to identify trends and recommend process improvements. Additionally, this role monitors compliance with payroll policies and ensures accurate and timely payroll processing. Responsibilities for this role include driving operational improvements, supporting HR initiatives, and contributing to the overall effectiveness of payroll and timekeeping systems.', N'Education
• Bachelor''s degree in Business Administration, Human Resources, Finance, Accounting, Information Systems, or related field, or equivalent years of experience and education. Required
Experience
• 5-7 years of timekeeping, payroll, payroll tax and compliance, accounting, or technology-enablement experience. Required
• Background in solving complex human resource pay and timekeeping compliance challenges with multiple layers of input. Practices a team-first orientation to resource planning and updates. Established proficiency in Workday payroll, ADP tax/garnishments and/or UKG Pro WFM timekeeping and accruals management. Systems thinker by default, driven to find solutions and achieve win/win outcomes. Driven, self-starter willing to take accountability and share in successes. Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Frequently (34-66% or 5.5 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder - Occasionally (6-33% or 3 hours)
• Repetitive Actions Pinch Forces - Rarely (1-5% or .5 hours) Pounds of force 0-25
• Repetitive Actions Fine Manipulation - Frequently (34-66% or 5.5 hours)
• Lifting – – Other Rarely (1-5% or .5 hours) Number of lbs 0-25', N'Education
• Bachelor''s degree or equivalent years of experience and education. Required
Experience
• 5 years of experience in timekeeping, payroll, payroll tax and compliance, accounting, or technology-enablement experience Required
• Background in solving complex human resource pay and timekeeping compliance challenges with multiple layers of input Preferred
• Established proficiency in Workday payroll, ADP tax/garnishments and/or UKG Pro WFM timekeeping and accruals management Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Frequently (34-66% or 5.5 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder - Occasionally (6-33% or 3 hours)
• Repetitive Actions Pinch Forces - Rarely (1-5% or .5 hours) Pounds of force 0-25
• Repetitive Actions Fine Manipulation - Frequently (34-66% or 5.5 hours)
• Lifting – – Other Rarely (1-5% or .5 hours) Number of lbs 0-25', SYSDATETIME()),
    (19, 19, N'Responsible for preparing, auditing, processing and disbursement of all payroll checks in computerized timekeeping and payroll systems. Reviews and ensures accurate computation of pay and interprets company policies and government regulations affecting payroll procedures in a multi-state environment. Ensures that payroll accounts and garnishments comply with and are reported timely to federal, state, and local agencies. Answers employee and manager timekeeping and payroll questions. Maintains timekeeping and payroll systems recordkeeping. Compiles periodic and special payroll reports as needed.', N'Prepares, audits, processes, and disburses payroll checks using computerized timekeeping and payroll systems. This position reviews and ensures accurate computation of pay, interprets company policies and government regulations affecting payroll procedures in a multi-state environment. In addition, this position ensures payroll accounts and garnishments comply with and are reported timely to federal, state, and local agencies. Additionally, this role answers employee and manager timekeeping and payroll questions, maintains payroll system records, and compiles periodic and special payroll reports. Responsibilities for this role include maintaining accurate payroll data and supporting compliance efforts to contribute to the organization''s financial integrity.', N'Education
• Associate degree in Accounting or a related field Required
Experience
• 3-4 years experience processing payroll, accounting, or tax experience. Required
• 1 year of complex payroll processing experience for employers with more than 1,000 employees working with multistate taxation. Preferred
Certification Registration_Licensure
• Fundamental Payroll Certification (FPC) or Certified Payroll Professional (CPP) Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', N'Education
• Associate’s degree in Accounting or in related field of study Required
Experience
• 3 years of experience in processing payroll Required
• 3 years of experience in accounting Required
• 3 years of experience in tax Required
• 1 year of experience in complex payroll processing for employers with more than 1,000 employees working with multistate taxation Preferred
Certification Registration_Licensure
• CPP – Certified Payroll Professional or FPC – Fundamental Payroll Certification Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', SYSDATETIME()),
    (20, 20, N'Coordinates the administration of the payroll wage and tax reporting process and assures compliance with all applicable state and federal regulations. Reviews and resolves complex issues related to payroll processing, payroll taxes, and payroll accounting. Responsible for tax and regulatory reporting including quarter-end / year-end payroll activities, reconciliations, and W2 process using ADP Smart Compliance. Researches and interprets multistate regulatory requirements and resolves timekeeping, payroll processing, payroll tax, garnishments, and taxable fringe benefits issues. Oversees the accounting for the entire payroll process including recording, correcting, and reconciling transactions related to payroll expenses, mandated payroll taxes expenses and liabilities and payroll corrections. Serves as payroll project manager and leads payroll system testing for enhancements and upgrades to validate expected functionality in partnership with HRIS and Accounting departments. The Senior Payroll Analyst will report to the Manager of Payroll.', N'Coordinates the administration of payroll wage and tax reporting processes to ensure compliance with applicable state and federal regulations. This position manages complex payroll processing, payroll taxes, and payroll accounting issues, including tax and regulatory reporting, quarter-end and year-end payroll activities, reconciliations, and W2 processing using ADP Smart Compliance. In addition, this position researches and interprets multistate regulatory requirements and resolves issues related to timekeeping, payroll tax, garnishments, and taxable fringe benefits. Additionally, this role oversees payroll accounting by recording, correcting, and reconciling transactions related to payroll expenses, mandated payroll tax liabilities, and payroll corrections. Responsibilities for this role include serving as payroll project manager and leading payroll system testing for enhancements and upgrades in collaboration with HRIS and Accounting departments to validate expected functionality.', N'Education
• Bachelor’s degree in Accounting, Business, Finance, or related business area Required
Experience
• Minimum of 3-4 years of multistate payroll processing Required
• Minimum of 3 years of payroll accounting experience Required
• 4-6 years of multistate payroll processing Preferred
• 4-6 years of payroll accounting experience Preferred
• Project management experience to oversee various payroll projects Preferred
• ADP Smart Compliance (payroll tax vendor) experience Preferred
• Workday payroll experience Preferred
• Kronos / Dimensions experience Preferred
Certification Registration_Licensure
• Certified Payroll Professional (CPP) certification Preferred
• Certified Public Accountant (CPA) certification Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', N'Education
• Bachelor’s degree in Accounting, Business, Finance, or related business area Required
Experience
• 3 years of experience in multistate payroll processing Required
• 3 years of experience in payroll accounting Required
• 4 years of experience in multistate payroll processing Preferred
• 4 years of experience in payroll accounting Preferred
• Project management experience Preferred
• Experience with ADP Smart Compliance Preferred
• Experience with Workday payroll Preferred
• Experience with Kronos / Dimensions Preferred
Certification Registration_Licensure
• CPP – Certified Payroll Professional, CPA-Certifiec Public Accountant Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', SYSDATETIME()),
    (21, 21, N'This position is responsible for the design, analysis and reporting of clinic hospital, and health system financial data for the purpose of physician and associate staff salary administration. The position will compute provider production statistics and maintain databases. The position will create methods for report generation, report scheduling, report distribution; data downloads and uploads, data manipulation, and data maintenance. The position will understand and help execute the unique compensation plans for the physician staff.', N'This position manages the design, analysis, and reporting of financial data related to physician and associate staff salary administration within a healthcare system. This position computes provider production statistics, maintains databases, and ensures accurate data management. In addition, this position develops methods for report generation, scheduling, distribution, data downloads, uploads, manipulation, and maintenance. Additionally, this role understands and supports the execution of unique physician compensation plans. Responsibilities for this role include collaborating with various teams to ensure accurate financial reporting and contributing to the effective administration of compensation programs.', N'Education
• Bachelor''s degree in Management of Information Systems (MIS) or Health Information Management or Computer Science or Business Administration or a related field Required
Experience
• 3-4 years of data management experience Required
• 3-4 years of data management experience in health care information systems Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Frequently (34-66% or 5.5 hours)
• Lifting –', N'Education
• Bachelor’s degree in Management of Information Systems or Health Information Management or Computer Science or Business Administration or a related field of study Required
Experience
• 3 years of experience in data management Required
• 3 years of experience in data management in health care information systems Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Frequently (34-66% or 5.5 hours)
• Lifting –', SYSDATETIME()),
    (22, 22, N'The Physician Compensation Consultant partners with Executive Committee and HR leadership across our organization to design Physician compensation programs and strategies to meet business needs. The Consultant will have expertise in the drivers of physician compensation and is responsible to research and embed best practices, benchmarks and trends into plan design and administration. Performs advanced analysis and modeling to make data driven recommendations in our various compensation programs. Leads the timelines and communication plans for the various Physician compensation programs. Consults with and provides guidance and resolution to the Physician Compensation team, Executive Committee members and leaders at all levels of the organization related to compensation needs. Serves as the project lead on major compensation projects.', N'Designs physician compensation programs and strategies to align with organizational business needs. This position partners with executive leadership and human resources to develop and administer compensation plans based on best practices, benchmarks, and industry trends. In addition, this position performs advanced data analysis and modeling to provide informed recommendations for various compensation programs. Additionally, this role leads project timelines, communication plans, and offers guidance and resolution to compensation teams and organizational leaders. Responsibilities for this role include serving as project lead on major compensation initiatives, ensuring effective program implementation and alignment with organizational goals.', N'Education
• Bachelor’s degree in Business or a related field Required
Experience
• 5 years of progressive experience in Physician Compensation including design and evaluation of compensation structures and processes, need to have worked with physicians and other leaders. Required
• Experience in a health care environment Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', N'Education
• Bachelor’s degree in Business or a related field Required
Experience
• 5 years of experience in Physician Compensation Required
• 5 years of experience in design and evaluation of compensation structures and processes Required
• 5 years of experience working with physicians and other leaders Required
• Experience in a health care environment Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', SYSDATETIME()),
    (23, 23, N'The Physician Compensation Solutions Consultant is responsible for advancing Gundersen Health’s Physician Compensation strategies through data analytics and insights, business process transformation, and continuous improvement. Collaborates with physician leaders, across HR Centers of Expertise, Business Partners, and HR Operations to drive excellence and efficiencies.', N'Advances physician compensation strategies through data analytics, business process transformation, and continuous improvement. This position collaborates with physician leaders, human resources centers of expertise, business partners, and human resources operations to drive excellence and efficiencies. Responsibilities for this role include analyzing compensation data, identifying opportunities for process improvements, developing solutions to enhance compensation programs, and supporting implementation efforts. Additionally, this role monitors trends and provides insights to inform decision-making and strategic planning. Contributes to optimizing compensation practices that support organizational goals and physician engagement.', N'Education
• Bachelor’s degree in business or related field Required
Experience
• 5-7 years of progressive experience in Physician Compensation including working with physicians and executive leadership. Required
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Approximately 8 hours in a day Repetitive Actions – Fine manipulation Approximately 8 hours in a day
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', N'Education
• Bachelor’s degree in business or related field Required
Experience
• 5 years of experience in Physician Compensation Required
• 5 years of experience working with physicians and executive leadership Required
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Approximately 8 hours in a day Repetitive Actions – Fine manipulation Approximately 8 hours in a day
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation -
• Lifting –', SYSDATETIME()),
    (24, 24, N'The Senior Retirement Benefit Specialist coordinates the administration of qualified and non-qualified retirement plans ensuring compliance with regulations and plan documents. This role involves consulting with employees on eligibility, contributions, and other retirement plan matters, as well as preparing communications, year-end contributions and coordinating audits.', N'Coordinates the administration of qualified and non-qualified retirement plans to ensure compliance with regulations and plan documents. This position manages employee consultations on eligibility, contributions, and retirement plan inquiries. In addition, this position prepares communications, processes year-end contributions, and coordinates audits. Additionally, this role collaborates with internal teams to maintain accurate records, monitor plan compliance, and support plan operations. Responsibilities for this role include ensuring regulatory compliance, facilitating employee understanding of retirement benefits, and supporting organizational retirement plan objectives.', N'Education
• Associate’s Degree in Business Administration, Human Resources, Accounting or related field Required
• Bachelor’s Degree in Business Administration, Human Resources, Accounting or related field Preferred
Experience
• 5-7 years’ experience in Human Resources with specific emphasis in retirement plan administration or 5-7 years’ experience with third party recordkeeper with emphasis on retirement plan administration. Required
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', N'Education
• Associate’s Degree in Business Administration, Human Resources, Accounting or related field Required
• Bachelor’s degree in Business Administration, Human Resources, Accounting or related field of study Preferred
Experience
• 5 years of experience in Human Resources with specific emphasis in retirement plan administration  or Required
• 5 years of experience with third party recordkeeper with emphasis on retirement plan administration Required
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office work)
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –', SYSDATETIME()),
    (25, 25, NULL, NULL, NULL, NULL, SYSDATETIME()),
    (26, 26, N'Supervises the processing and distribution of hourly and exempt multi-state payrolls, ensuring compliance with regulatory and taxing authorities. Oversees the maintenance of individual payroll records, payroll distribution, preparation of year-end tax forms, and compilation of periodic and special reports on payroll matters. The supervisor will test and implement payroll system changes, enhancements and process improvements.', N'Supervises the processing and distribution of hourly and exempt multi-state payrolls, ensuring compliance with regulatory and taxing authorities. This position manages payroll record maintenance, payroll distribution, preparation of year-end tax forms, and compilation of periodic and special payroll reports. In addition, this position tests and implements payroll system changes, enhancements, and process improvements. Additionally, this role coordinates with cross-functional teams to ensure accurate and timely payroll operations. Contributes to organizational efficiency by maintaining payroll accuracy and regulatory compliance.', N'Education
• Associate degree in Business or Human Resources or computer systems field Required
Experience
• 5-7 years of payroll experience. Required
• 1 year of experience with Lawson, Kronos or other HRIS systems. Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', N'Education
• Associate’s degree in Business or Human Resources or computer systems field Required
Experience
• 5 years of experience in payroll Required
• 1 year of experience in Lawson, Kronos or other HRIS systems Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Continually (67-100% or 8 hours)
• Static Standing -
• Walking/Standing -
• Driving -
• Reaching Below Shoulder -
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Continually (67-100% or 8 hours)
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', SYSDATETIME()),
    (27, 27, N'The VP, Total Rewards will create and deliver a comprehensive total rewards strategy and program that aligns with the mission, vision and values of Acme Health and inspires employees to live their best lives. Success in this role will require the ability to educate, influence, and inspire action, along with extensive knowledge and experience in compensation and benefits.

In addition, this position is responsible for the strategic oversight of the payroll and leave of absence functions. It ensures all systems and processes align with the organization’s mission and are efficient, effective, and compliant with applicable laws, regulations, and requirements. The VP will lead, develop, and retain high performing teams that consistently deliver value to the organization.', N'Develops and implements comprehensive total rewards strategies and programs that align with organizational goals and motivate employees. This position leads the design, management, and execution of compensation, benefits, and incentive programs to attract, retain, and engage talent while ensuring compliance with applicable laws and regulations. In addition, this position oversees payroll and leave of absence functions, collaborates with senior leadership and cross-functional teams to analyze market trends, and implements competitive reward solutions. Additionally, this role manages vendor relationships, monitors program effectiveness, drives continuous improvement initiatives, and directs high-performing teams to deliver consistent value. Responsibilities for this role include educating and influencing leadership, maintaining regulatory compliance, designing equitable pay structures, administering benefits plans, and supporting organizational talent management objectives.', N'Education
• Bachelors in Human Resources, Business or Finance Required
• Master''s Preferred
Experience
• 10+ years in related HR leadership role Experience in a large, complex organization with competing priorities and a multitude of stakeholders. Required
• Experience within a health system or other healthcare organization is Required
• Experience developing Total Rewards Strategy and execution plans, including ROI and budget management. Required
• Experience designing and administering compensation plans. Required
• Experience designing and administering benefit plans. Required
• Proven leadership building teams and developing individuals. Required
• Innovative, forward thinker with a demonstrated competency in strategy and leadership, strong communication, and relationship management skills, politically savvy and demonstrated ability to work with and lead cross-functional team. Required
• Experience optimizing HR systems and processes. Required
• Deep knowledge of using contemporary HR practices and methods and understanding industry best practices and trends. Required
• Demonstrated application of change management methodologies in a matrixed, complex operation. Required
• Experience in a shared services environment is strongly Required
• Experience with collective bargaining agreements Required
• . Preferred
• Proficiency with Workday would be , but not required. Preferred
• . Preferred
• . Preferred
Certification Registration_Licensure
• CCP, CBP or CEBS, SHRM SCP or SPHR Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Frequently (34-66% or 5.5 hours)
• Static Standing - Frequently (34-66% or 5.5 hours)
• Walking/Standing - Frequently (34-66% or 5.5 hours)Stooping/Bending Occasionally (6-33% or 3 hours)Squatting Occasionally (6-33% or 3 hours)Kneeling/Half Kneel Occasionally (6-33% or 3 hours)Climbing Stair Occasionally (6-33% or 3 hours)Reaching - Shoulder Level Frequently (34-66% or 5.5 hours)
• Driving -
• Reaching Below Shoulder - Frequently (34-66% or 5.5 hours)Reaching - Above Shoulder Frequently (34-66% or 5.5 hours)
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Frequently (34-66% or 5.5 hours)
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', N'Education
• Bachelor’s in Human Resources, Business or Finance Required
• Master’s in related field of study Preferred
Experience
• 10 years of experience in related HR leadership role Required
• Experience in a large, complex organization with competing priorities and a multitude of stakeholders Required
• Experience within a health system or other healthcare organization Required
• Experience developing Total Rewards Strategy and execution plans, including ROI and budget management Required
• Experience designing and administering compensation plans Required
• Experience designing and administering benefit plans Required
• Proven leadership building teams and developing individuals Required
• Experience optimizing HR systems and processes Required
• Experience in a shared services environment Required
• Experience with collective bargaining agreements Required
Certification Registration_Licensure
• CBP – Certified Benefits Professional, CCP – Certified Compensation Professional, CEBS – Certified Employee Benefit Specialist, SHRM SCP – Society for Human Resource Management Senior Certified Professional, SPHR – Senior Professional in Human Resources Preferred
Environmental Conditions
• Not substantially exposed to adverse environmental conditions (as in typical office or administrative work).
Physical Requirements/Demands of the Position
• Sitting - Frequently (34-66% or 5.5 hours)
• Static Standing - Frequently (34-66% or 5.5 hours)
• Walking/Standing - Frequently (34-66% or 5.5 hours)Stooping/Bending Occasionally (6-33% or 3 hours)Squatting Occasionally (6-33% or 3 hours)Kneeling/Half Kneel Occasionally (6-33% or 3 hours)Climbing Stair Occasionally (6-33% or 3 hours)Reaching - Shoulder Level Frequently (34-66% or 5.5 hours)
• Driving -
• Reaching Below Shoulder - Frequently (34-66% or 5.5 hours)Reaching - Above Shoulder Frequently (34-66% or 5.5 hours)
• Repetitive Actions Pinch Forces -
• Repetitive Actions Fine Manipulation - Frequently (34-66% or 5.5 hours)
• Lifting –
Core for Leaders
• 1. Strategic Planning and Execution: Monitors industry and market developments, assesses their impact on area of responsibility, participates in creating strategic responses, builds operational plans for the team(s), clearly communicates plans, and secures buy-in and commitment from all staff members.
• 2. Quality Care and Service Excellence: Drives the seamless delivery of high-quality, safe patient care while ensuring exceptional patient and customer experiences. Applies Continuous Quality Improvement methodologies and strategic planning frameworks to guide decisions, enhancements, and system development.
• 3. Safety Leadership: Fosters and maintains a culture where safety is the highest priority for both patients and team members.
• 4. Financial Stewardship: Leverages established systems and processes to maintain accountability for operational effectiveness and responsible resource allocation.
• 5. People Leadership: Utilizes proven methods to recruit, engage, develop, inspire, manage, and retain a high-performing team of skilled professionals.
• 6. Cross-Functional Leadership: Leads by example to achieve objectives through integrated processes and collaborative initiatives. Actively engages with and supports brand and service delivery teams as needed.
• 7. Regulatory Compliance: Ensures full implementation of and adherence to all regulatory agency requirements.
• 8. Community Relations: Acts as the organization''s representative and connector with the community.
• 9. Department-Specific Responsibilities: Fulfills duties and responsibilities unique to the specific department as applicable.', SYSDATETIME());

/* ---------------------------------- essential_functions_original */
INSERT INTO dbo.essential_functions_original (job_id, function_text, sort_order) VALUES
    (1, N'Compiles, analyzes, and reports benefit data including employee, benefit plan and financial for Benefit''s strategic planning and evaluation, best practices, and benchmark surveys.', 1),
    (1, N'Provides guidance and counsel to employees, HRIS representatives, and managers on the requirements and provisions of benefit programs.', 2),
    (1, N'Responsible for communication and education relating to benefit offering. Coordinates open enrollment communication and designs and communicates annual benefit enrollment materials.', 3),
    (1, N'Inform and educate management and employees about changes to benefit plans, administrative practices and legislated requirements and programs.', 4),
    (1, N'Works with vendors, carriers, and consultants to prepare bid specifications and RFPs, analyze proposals and renewal information, and interprets contracts. Engages in day-to-day vendor management including monitoring performance of service level agreements.', 5),
    (1, N'Design and continuously improve business processes and workflows that leverage technology to improve employee experience and reduce manual work.', 6),
    (1, N'Responsible for data necessary to complete government compliance activities (5500s, audits, etc.), employee mailings, vendor billings, coordinating data collection and updating numerous reports for management. Assures processes and procedures are in place to capture and maintain consistent and accurate benefit related data.', 7),
    (1, N'Monitors plan limits, eligibility, and other restrictions on plan participation to ensure compliance with both plan provisions and government requirements. Responsible for legal compliance documentation (SPDs, SARs).', 8),
    (1, N'Research current benefit trends and regulatory/legislated requirements and recommends programs/changes to the Manager of Benefits.', 9),
    (1, N'Responsible for complex/tier 3 issue resolution and customer service.', 10),
    (1, N'Adheres to regular and predictable attendance.', 11),
    (1, N'Performs other duties as assigned.', 12),
    (2, N'Serve as the primary point of contact for candidates regarding employee benefits during the recruitment and onboarding process.', 1),
    (2, N'Educate and guide new staff on available benefits, enrollment procedures, and timelines to ensure a seamless onboarding experience.', 2),
    (2, N'Collaborate with HR and talent acquisition teams to align benefits communication with overall onboarding strategies.', 3),
    (2, N'Provide personalized benefits counseling to employees planning for retirement, including reviewing benefit options, retirement plans, and available resources.', 4),
    (2, N'Assist retiring employees in understanding their benefits, healthcare options, and any necessary paperwork or processes.', 5),
    (2, N'Develop and deliver educational materials, presentations, and workshops related to employee benefits and retirement planning.', 6),
    (2, N'Maintain up-to-date knowledge of company benefits programs, policies, and regulatory requirements.', 7),
    (2, N'Build strong relationships with employees and candidates to foster trust and ensure clear communication regarding benefits.', 8),
    (2, N'Track and report on benefits education activities and employee engagement metrics.', 9),
    (3, N'Answers department telephone/responds to requests for information', 1),
    (3, N'Uses computer programs to prepare documents/reports', 2),
    (3, N'Assists/directs customers', 3),
    (3, N'Maintains employee records and administers benefits based on practice', 4),
    (3, N'Manages assignments/projects', 5),
    (3, N'Address and resolve benefits-related issues and concerns raised by employees', 6),
    (3, N'Assist in the administration of employee benefits programs, including enrollment, changes, and terminations', 7),
    (3, N'Provide support to employees regarding benefits inquiries, including health insurance, retirement plans, and other employee benefits.', 8),
    (3, N'Extracts and compiles data for reporting to leaders on monthly/weekly basis and by request (i.e., FMLA weekly reports)', 9),
    (3, N'Coordinates PTO buy-back process', 10),
    (3, N'Coordinates file shuffle process', 11),
    (3, N'Manages scanning process of employee information', 12),
    (3, N'Manages online employee personnel and health files', 13),
    (3, N'Processes and audits monthly reports to ensure accuracy', 14),
    (3, N'Generate reports on benefits utilization and trends for review', 15),
    (3, N'Manage and update new hire orientation materials', 16),
    (3, N'Ensures accuracy of employee benefits and premiums through on-line enrollment and the Infor system', 17),
    (3, N'Assists with coordination of timely benefit communication throughout the year', 18),
    (3, N'Communicate benefits information to employees through presentations, meetings and written materials', 19),
    (3, N'Coordinates application of benefits and interprets plan provisions', 20),
    (3, N'Assists in planning benefit changes', 21),
    (3, N'Provides age-appropriate care/service as applicable to role', 22),
    (3, N'Ensure compliance with federal and state regulations related to employee benefits', 23),
    (3, N'Uses Information Systems to their full capability', 24),
    (3, N'Duties as defined by specific department (if applicable)', 25),
    (3, N'Attends regularly-scheduled and assigned shifts', 26),
    (4, N'Educate and inform employees of rights and options under various benefit plans. Answer employee questions and provide guidance in respect to benefit choices on a daily basis.', 1),
    (4, N'Provide individual consultations for employees anticipating retirement to explain continuing coverage under the health and welfare plans, for beneficiaries upon employees'' deaths to complete life claim and to transition other benefits to beneficiary, and for injured or sick employees who need to file disability claims.', 2),
    (4, N'Develop, maintain, revise, and conduct new employee orientations to assure new employees have complete understanding of benefits available to them, time period for enrolling, and consequences of elections and/or waiver of benefits.', 3),
    (4, N'Coordinate writing and distribution of summary plan descriptions, working in partnership with Health Plan and other insurance carriers to continually review materials for accuracy, direct rewrites, and facilitate distribution to employees.', 4),
    (4, N'Oversee and coordinate work of third party administrator for processing of Medical Reimbursement and Dependent Care Reimbursement accounts to assure that claims submitted are paid in compliance with the law and processed timely so as to meet payroll deadlines for reimbursement on employees'' paychecks.', 5),
    (4, N'Enroll new employees in benefits elected, assuring that enrollment forms are properly completed and submitted to Carrier(s), and payroll deductions are established on a timely basis.', 6),
    (4, N'Provide terminating employees with COBRA notices for health and dental plans as well as conversion rights under life and disability plans. Work individually with employees to assist them in understanding rights and options available to them.', 7),
    (4, N'Work directly with Carriers to resolve coverage and benefit problems as they arise. Maintain ongoing relationship with Carrier periodically reviewing benefit offering and flow of information to assure both meet the needs of Organization as well as the Employee and then work directly with Carrier to implement change when necessary.', 8),
    (4, N'Audit monthly invoices from Carriers for accuracy and submit to Accounts Payable for payment. Reconcile personal after tax employee payments employees who are on COBRA, FMLA, and personal leaves.', 9),
    (4, N'Assist in implementation of new benefit programs and/or change in Carriers/Benefit offering. This may involve completing survey requests, retrieving census data from Lawson payroll system, developing and reviewing communication materials, and conducting employee education sessions.', 10),
    (4, N'Keep current on benefit law updates and new developments, implementing change in process where necessary, and amending written materials as needed to be compliant with the law.', 11),
    (4, N'Coordinate annual open enrollment process. Establish open enrollment timeline to account for actual period of enrollment, data summarization, and transfer of data to Carriers and third party administrators. Develop and distribute communication materials to employees. Review electronic enrollment files and provide to Carriers to accomplish actual enrollment.', 12),
    (4, N'Serves on committees such as Integrated Health and Productivity Management and PTO Donation Committee to facilitate good communication and concerted work effort within HR and between related departments such as the Health Plan and Community Health and Preventive Care Services.', 13),
    (4, N'Supports retirement plan administration by assisting with employee questions regarding distributions and accessing the benefits line. Calculates employee vesting and prepares distribution requests to be sent to Trustee. Processes hardship requests. Administers other voluntary benefit plans such as home and auto coverage.', 14),
    (4, N'Adheres to regular and predictable attendance.', 15),
    (4, N'Assists in special projects as needed, including triaging questions as posted on Employee Feedback Board.', 16),
    (6, N'Perform market pricing analysis of leadership and staff job descriptions to determine appropriate pay level and exemption status.', 1),
    (6, N'Maintenance of the market-pricing system, including survey participation', 2),
    (6, N'Complete compensation surveys based on organizational data, review survey results and compile comparison summaries.', 3),
    (6, N'Perform auditing and non-discrimination testing for applicable compensation programs based on regulatory guidance.', 4),
    (6, N'Assists with job architecture set up and maintenance, including testing, in the HRIS system', 5),
    (6, N'Administer the annual salary increase processes ensuring accuracy and efficiency.', 6),
    (6, N'Responsible for step increase administration and auditing', 7),
    (6, N'Performs regular auditing of various compensation data and programs to ensure accuracy.', 8),
    (6, N'Assist in the research, development and implementation of various total compensation programs, including pay for performance, staff, leadership and executive compensation, and variable pay programs such as shift differential, premium pays and incentives.', 9),
    (6, N'Research current (and pending) legislation/regulatory guidelines applicable to compensation and communicate related findings and recommendations.', 10),
    (6, N'Compile and maintain departmental documentation relating to compensation processes and procedures.', 11),
    (6, N'Performs other job-related responsibilities as assigned.', 12),
    (7, N'Consults with HRBPs, leadership at all levels of the organization and Compensation staff to identify compensation program needs. Designs and develops new programs based on the organizational needs.', 1),
    (7, N'Partners with Compensation team to conduct ongoing, pro-active analysis and research and brings forward recommendations to meet emerging business needs.', 2),
    (7, N'Regularly monitors external trends in the area of compensation and brings forward ideas for implementation of new and change of existing compensation programs.', 3),
    (7, N'Leads the communication plan for the annual compensation processes. Works closely with the compensation team to ensure adherence to deadlines.', 4),
    (7, N'Consults with leadership across the organization and HRBP’s on the development of new roles and department structure changes.', 5),
    (7, N'Partner in the development and implementation of new policies, consulting with HRBPs and leadership throughout the organization, and provides input and oversight into the updating of existing policies.', 6),
    (7, N'Drives statistical modeling using advanced tools and techniques to solve workforce issues related to pay.', 7),
    (7, N'Partner with recruitment on more complex compensation offers for staff and leadership positions, consulting with the Manager as needed.', 8),
    (7, N'Leads and oversees the entire job evaluation process. Ensures analysts conduct accurate job analysis according to policy and practice. When appropriate, assigns job evaluation requests to the analyst for completion, determines when we use a different market approach and assigns work as appropriate, ensures the completion of requested job evaluations in a timely manner. Reviews compensation decisions on exemption status and pay grade assignments, consulting with the Manager as needed.', 9),
    (7, N'Oversees the use of the pay factors system to ensure the compensation department is using the full functionality of this system in completing compensation work.', 10),
    (7, N'Makes recommendations for the continuous quality improvement strategies for compensation programs.', 11),
    (7, N'Serves as a project lead in the development and delivery training related to compensation.', 12),
    (7, N'Provides guidance, work assignments and training for compensation staff.', 13),
    (7, N'Adheres to regular and predictable attendance.', 14),
    (7, N'Performs other duties as assigned.', 15),
    (8, N'Design and manage a variety of benefits programs and policies including health and welfare, wellness, retirement, tuition, leave of absence and time off, including budgeting, strategy and competitive analysis', 1),
    (8, N'Knowledgeable about the concepts, compliance and tools used for benefits administration and analysis', 2),
    (8, N'Possess expertise in regulations and applicable governing bodies, and apply that to current and future design and administration', 3),
    (8, N'Using deep analytical skills, ability to break down complex questions / data into well-structured analyses, and synthesize key points, providing the financial business case as needed', 4),
    (8, N'Effectively manage concurrent programs, processes and initiatives collaborating with and influencing a wide range of stakeholders, and have a proven ability to think end-to-end about the work to be implemented', 5),
    (8, N'Expertise with vendor management, including contract negotiation and management', 6),
    (8, N'Expertise, confidence and skill to develop and deliver formal and informal reports, presentations and communications to executive audiences', 7),
    (8, N'Transformational Leadership, accountable to the organization''s workforce strategies, mature the human resource function, provide customer service, and create business value – by driving program excellence and strategic impact. This includes inspiring employees to strive beyond required expectations and to work towards a shared vision.', 8),
    (9, N'Design, develop and manage a variety of compensation programs and processes including base salary, variable pay programs, program budgeting, compensation strategy and competitive pay analysis', 1),
    (9, N'Knowledgeable across the full spectrum of methodologies and tools used for compensation-related market research, modeling and analysis', 2),
    (9, N'Using analytical skills, synthesize complex questions / data into well-structured recommendations and stories accompanied by the financial business case', 3),
    (9, N'Knowledgeable about regulations and applicable governing bodies, and apply that to current and future design and administration', 4),
    (9, N'Effectively manage multiple programs, processes and initiatives collaborating with and influencing a wide range of stakeholders, and have a proven ability to think end-to-end about the work to be implemented', 5),
    (9, N'Expertise within Microsoft Excel and other analysis tools', 6),
    (9, N'Design and manage job architecture and compensation administration within various HR systems, including Workday', 7),
    (9, N'Develop and deliver formal and informal reports, presentations and communications to executive audiences', 8),
    (9, N'Transformational Leadership, accountable to the organization''s workforce strategies, mature the human resource function, provide customer service, and create business value – by driving program excellence and strategic impact. This includes inspiring employees to strive beyond required expectations and to work towards a shared vision.', 9),
    (10, N'Serve as primary contact for employees and managers to provide clear guidance on leave eligibility, documentation requirements, timelines and return to work procedures.', 1),
    (10, N'Respond to HR Service Center tickets by providing timely, accurate guidance and resolution on leave-related inquiries.', 2),
    (10, N'Gathers and completes all required paperwork determining leave eligibility and managing medical certification.', 3),
    (10, N'Manages scanning process of employee information.', 4),
    (10, N'Administer the leave process from initial notice through return to work.', 5),
    (10, N'Maintain accurate and confidential records in HRIS related systems.', 6),
    (10, N'Manage online employee personnel and health files.', 7),
    (10, N'Processes and audits monthly reports to ensure accuracy.', 8),
    (10, N'Perform other job-related responsibilities as assigned.', 9),
    (10, N'Adheres to regular and predictable attendance', 10),
    (11, N'Communicate with employees regarding their leave needs, ensuring they understand their responsibilities and the documentation required for leave eligibility.', 1),
    (11, N'Respond to HR Service Center tickets by providing timely, accurate guidance and resolution on leave-related inquiries.', 2),
    (11, N'Administer the leave process from initial notice through return to work, including gathering necessary paperwork, determining eligibility, and managing medical certifications.', 3),
    (11, N'Adjudicate leave request in accordance with applicable leave laws.', 4),
    (11, N'Maintain regular communication with employees on leave to facilitate a smooth transition back to work and relay relevant information between employees and their managers.', 5),
    (11, N'Advise leaders and employees on the interaction of leave laws with paid time off, workers'' compensation, and disability benefits.', 6),
    (11, N'Monitor and track all leave types in the organization’s systems, ensuring accurate reporting and compliance with internal policies and external regulations.', 7),
    (11, N'Audit leave records for accuracy and compliance within company policies and applicable laws', 8),
    (11, N'Educate employees and managers on leave policies and procedures.', 9),
    (11, N'Executes all job duties with a high-level of customer service and empathy toward employees accessing their leave benefits.', 10),
    (11, N'Partner with Employee Health and HR Business Partners to manage complex leave cases.', 11),
    (11, N'Perform other job-related responsibilities as assigned.', 12),
    (11, N'Adheres to regular and predictable attendance', 13),
    (12, N'Develop, implement, and administer leave programs to assist leaders and the organization in managing absences while ensuring compliance with applicable laws.', 1),
    (12, N'Communicate with employees regarding their leave needs, ensuring they understand their responsibilities and the documentation required for leave eligibility.', 2),
    (12, N'Handle the leave administration process from initial notice to return to work, including gathering necessary paperwork, determining eligibility, and managing medical certifications.', 3),
    (12, N'Maintain regular communication with employees on leave to facilitate a smooth return to work and relay information between employees and their managers.', 4),
    (12, N'Advise management and employees on the interaction of leave laws with paid time off, workers'' compensation, and disability benefits.', 5),
    (12, N'Interpret and administer leave programs and policies in accordance with applicable federal and state employment laws and create policies and procedures to ensure compliance and best practices.', 6),
    (12, N'Monitor and track all leave types in the organization’s systems, ensuring accurate reporting and compliance with internal and external policies.', 7),
    (12, N'Partner with HR representatives to manage Family Medical Leave and other leave types, ensuring accurate tracking and documentation.', 8),
    (12, N'Create and maintain processes that are easy to navigate, compliant, and reduce manual entry.', 9),
    (12, N'Monitors the quality of time off and leave processes and customer service. Determines the necessary metrics to track our work and processes and identifies areas of improvement.', 10),
    (12, N'Produce and manage reporting metrics and analytics for all leave cases, presenting findings as required.', 11),
    (12, N'Collaborate with Employee & Labor Relations, Legal, and Total Rewards leadership on new and changing leave laws and regulations.', 12),
    (12, N'Provide training and education to employees and leaders on leave programs and policies.', 13),
    (12, N'Adheres to regular and predictable attendance.', 14),
    (12, N'Perform other job-related responsibilities as assigned.', 15),
    (13, N'Manage a variety of benefits programs and policies including health and welfare, wellness, tuition, leave of absence and time off, including budgeting, ongoing administration and compliance.', 1),
    (13, N'Oversee the annual open enrollment process including communications', 2),
    (13, N'Oversight of the tools and technology used to administer benefits, ensure optimal use to deliver effective, efficient and compliant solutions', 3),
    (13, N'Responsible for annual premium/cost share setting', 4),
    (13, N'Manage relationships with our service providers ensuring they are performing to agreed upon standards. Participates in negotiation/renegotiation and contract finalization.', 5),
    (13, N'You have the skill to develop and deliver formal and informal reports, presentations and communications to leadership', 6),
    (13, N'Regularly partner with finance and other key stakeholders to ensure effective financial budget management, as well as cost savings/containment strategies are identified and implemented', 7),
    (13, N'You are a creative problem solver', 8),
    (13, N'Responsible to ensure compliance with ERISA, DOL, IRS and other relevant regulatory bodies including plan document maintenance, government filings and required notices', 9),
    (13, N'You have expertise with the tools and HR database applications used to manage benefits', 10),
    (13, N'Oversees and develop strong people management skills', 11),
    (13, N'Develops and utilizes strong communication skills', 12),
    (13, N'Direct and coordinate projects', 13),
    (14, N'Lead Annual Compensation Cycles: Oversee and manage the annual compensation cycles, ensuring fair and competitive compensation practices. Provide guidance on market fluctuation and budget.', 1),
    (14, N'Develop Financial Models for Compensation Planning: Create and maintain complex financial models to budget and forecast compensation costs, analyze compensation scenarios, and support strategic decision-making.', 2),
    (14, N'Deliver Compensation Analytics: Design compensation analytics that evaluate the effectiveness of current compensation programs, identify trends, and recommend adjustments to ensure competitiveness and alignment with enterprise goals.', 3),
    (14, N'Administer Budgeting and Forecasting: Collaborate with the finance team to develop and manage the compensation budget, ensuring alignment with financial goals and constraints. Provide accurate forecasting and reporting on compensation expenses.', 4),
    (14, N'Creative Problem Solver: Utilize advanced data analytics and compensation practices to solve complex issues regarding compensation trends, pay equity, and market competitiveness. Present findings to senior leadership to inform strategic decisions.', 5),
    (14, N'Promote Compensation Benchmarking: Lead the benchmarking process to compare compensation practices against industry standards. Optimally leverage technology (Payfactors & HRIS) to recommend adjustments.', 6),
    (14, N'Oversee Compliance and Risk Management: Ensure all compensation practices comply with relevant laws and regulations. Conduct regular audits and risk assessments to identify and mitigate potential compliance issues.', 7),
    (14, N'Provide Future Insights: Collaborate with the Dir-Compensation to provide insights and recommendations on compensation trends, cost implications, and potential adjustments to ensure the organization remains competitive in the market.', 8),
    (14, N'Collaborate on Compensation Alignment: Work closely with cross-functional and enterprise teams to ensure that compensation strategies align with business objectives and keep pace with market trends.', 9),
    (14, N'Fosters Relationships: Partners with internal and external stakeholders alike to build shared areas of focus, extend insight, collect feedback, and strengthen compensation program cohesion.', 10),
    (14, N'Coordinates Change Communication. Is the catalyst to drive change forward through integrated communication and learning on compensation program principles.', 11),
    (15, N'1.0 Organizational Strategy and Implementation -- Understanding market trends and the impact on their AOR, contributing to AOR strategic and operational plans, translating these plans, and ensuring the understanding, alignment and commitment of AOR staff.', 1),
    (15, N'2.0 Fiscal Management -- Effectively using established processes to ensure accountability for effective operations and resource management.', 2),
    (15, N'3.0 Human Resource Management -- Effectively using established processes to: select, align, engage, develop, manage, and retain a team of highly skilled staff.', 3),
    (15, N'4.0 Excellence in Service and Clinical Quality -- Achieving seamless delivery of quality patient care and safety, excellence in patient experience and customer service.', 4),
    (15, N'5.0 Organizational Leadership -- Providing leadership and accomplishing objectives by ensuring the integration of processes and initiatives while modeling collaboration.', 5),
    (16, N'1.0 Organizational Strategy and Implementation -- Understanding market trends and the impact on their AOR, contributing to AOR strategic and operational plans, translating these plans, and ensuring the understanding, alignment and commitment of AOR staff.', 1),
    (16, N'2.0 Fiscal Management -- Effectively using established processes to ensure accountability for effective operations and resource management.', 2),
    (16, N'3.0 Human Resource Management -- Effectively using established processes to: select, align, engage, develop, manage, and retain a team of highly skilled staff.', 3),
    (16, N'4.0 Excellence in Service and Clinical Quality -- Achieving seamless delivery of quality patient care and safety, excellence in patient experience and customer service.', 4),
    (16, N'5.0 Organizational Leadership -- Providing leadership and accomplishing objectives by ensuring the integration of processes and initiatives while modeling collaboration.', 5),
    (17, N'Develops annual retirement and savings benefits budget and accrual. Provides input to and manages changes to the annual operating budget on regular basis', 1),
    (17, N'Prepares, communicates and educates on changes in benefits, policies and practices within the organization', 2),
    (17, N'Innovates and suggests improvements and changes in retirement plans and financial well-being programs', 3),
    (17, N'Measures and assesses effectiveness and success of the retirement benefits offered to help drive design, innovation, as well as effective employee communication campaigns', 4),
    (17, N'Ensures the highest level of compliance with IRS, ERISA and other federal laws and regulations that govern U.S. retirement plans', 5),
    (17, N'Manages and chairs the organizational administrative committees which have fiduciary and governance responsibilities over the retirement plans', 6),
    (17, N'Provides plan metrics, compliance information and recommendations around program changes to senior executives and the governing committees', 7),
    (17, N'Works cross-functionally with Communications team to create communication and education strategies and plans that help employees understand and take best advantage of retirement and financial well-being benefits', 8),
    (17, N'Manages accuracy of legal retirement plan documents against administrative processes and employee facing communication to ensure compliance', 9),
    (17, N'Ensures stakeholders, including senior leaders are informed of new and pending legislation, regulations and reporting requirements that affect the retirement plans and the participants in those benefits', 10),
    (17, N'Assesses, benchmarks and holds service providers accountable to delivery of services and contractual provisions', 11),
    (17, N'Works cross-functionally with broader Total Rewards, Partner Resources, Legal, Tax, Payroll, Technology, Accounting & Finance teams to ensure that the development, administration, communication, changes to programs, impacts on costs and opportunities uncovered are fully vetted', 12),
    (17, N'Coordinate and engage with ERISA attorney, investment consultants and other professionals as needed to support plan compliance', 13),
    (17, N'Provides strategic guidance and expertise around technology needs and data flow requirements to support programs', 14),
    (17, N'Oversees and develop strong people management skills', 15),
    (17, N'Develops and utilizes strong communication skills', 16),
    (17, N'Direct and coordinate projects', 17),
    (18, N'Drives continuous improvements to timekeeping and payroll processes, HR technology, and data management with the goal of providing elevated efficiency in timekeeping and payroll administration.', 1),
    (18, N'Proactively identify opportunities to drive greater organizational impact through analytics.', 2),
    (18, N'Consults with customers and stakeholders to design and prototype solutions that effectively leverage data and related tools to advance insights to timekeeping and payroll and/or expose risks.', 3),
    (18, N'Leads timekeeping and payroll projects and partners on enterprise solution upgrades including analysis, testing and implementation.', 4),
    (18, N'Design, develop, implement, and maintain timekeeping and payroll related reporting and dashboards to diverse stakeholders.', 5),
    (18, N'Support HR data & reporting governance processes and ensure applicable governance standards are followed.', 6),
    (18, N'Provides mentoring and technical guidance and support to team.', 7),
    (18, N'Adheres to regular and predictable attendance.', 8),
    (18, N'Performs other duties as assigned.', 9),
    (19, N'Prepare, audit, analyze, and correct data collected in the timekeeping system to process hourly and salaried payroll using the payroll system. Coordinate and process special payroll runs outside of biweekly and semimonthly payroll processing.', 1),
    (19, N'Review and ensure accurate computation of pay and interprets company policies and governmental regulations affecting payroll procedures. Makes recommendations on process improvements as needed.', 2),
    (19, N'Creates and maintains the timekeeping system for tracking of absence management plans which includes PTO, vacation, sick, and sabbatical plans. Periodically audits plans to determine that employees are enrolled in correct plan. Responsible for transferring employee between plans when employee status is changed. Calculates and verifies amount available for cash out on termination of employment, retirement, or as in-service option. Interprets company time off policies in assisting employees with questions about accruals, cash out, carry over, and required usage.', 3),
    (19, N'Reconcile and balance payroll for electronic transfer to banks for distribution to employees and tax authorities. Ensures that payroll accounts and garnishments comply with and are reported timely to federal, state, and local agencies.', 4),
    (19, N'In conjunction with HRIS staff, maintain the payroll and timekeeping systems. Includes set up of new timekeeper security access. Assists with creation and maintenance of job codes and pay codes in the payroll and timekeeping systems. Provides recommendations on payroll and timekeeping system set-up as part of on-going maintenance and system upgrades or testing.', 5),
    (19, N'Provide a high level of customer service by promptly and accurately answering employee and manager timekeeping and payroll needs in partnership with Help Desk.', 6),
    (19, N'Prepare, reconcile, and distribute of W2 reporting to employees and to government. Calculate taxable fringe benefits and record imputed income due for year-end processing.', 7),
    (19, N'Participates in system upgrades, new application implementations, system patches, process improvement, system integration, and system testing projects. Works with HRIS Team, Management, and IS to develop and implement the automation of HR processes as they relate to the HRIS and sub-systems; identifies issues and recommends solutions.', 8),
    (19, N'Work with manager to develop content and conduct on-going new employee orientation, user group meetings, leader presentations, and other communication and education efforts.', 9),
    (19, N'Works with HRIS staff to create and write audit reports for internal department use and for management tools.', 10),
    (19, N'Adheres to regular and predictable attendance.', 11),
    (19, N'Assists department in special projects as required.', 12),
    (20, N'Analyze, audit, reconcile, and resolve complex time administration, payroll processing, and employee payroll issues to ensure smooth payroll processing.', 1),
    (20, N'Responsible for tax and regulatory reporting, quarter-end / year-end payroll activities and reconciliations and W2 process, including wage and hour laws, unemployment, and all other submissions required by federal and state tax authorities.', 2),
    (20, N'Researches and interprets regulatory requirements and resolves payroll, time keeping, tax, garnishments, and taxable fringe benefits issues for payroll processing. Recommends changes to the Manager of Payroll and senior leadership based on regulatory requirement changes.', 3),
    (20, N'Manage multi-state payroll tax set up, issues, research and resolve tax notices partnering with ADP Smart Compliance vendor. Set up all new state withholding, unemployment, and other tax related accounts, when necessary.', 4),
    (20, N'Oversees the accounting for the entire payroll process. Record, correct, and reconcile transactions related to payroll expenses, mandated payroll taxes expenses and liabilities and payroll corrections. Responsible for coordination efforts with Accounting and Treasury Departments for payroll corrections and amendments.', 5),
    (20, N'Prepare and review payroll accounting journal entries, review monthly payroll account reconciliations including recording / reconciling intercompany payroll transactions ensuring compliance with generally accepted accounting principles.', 6),
    (20, N'Participate in the interim and annual financial audit process.', 7),
    (20, N'Provides guidance and counsel to employees, HRIS representatives, and managers on the requirements and provisions wage and hour laws, wage and overtime calculations, payroll tax regulations and garnishment requirements.', 8),
    (20, N'Design and continuously improve payroll business processes and workflows that leverage technology to improve employee experience, increase efficiency and reduce manual work.', 9),
    (20, N'Perform payroll system testing for enhancements and upgrades to validate expected functionality as designed in partnership with HR, HRIS, Accounting, Finance departments; recommend and implement system and procedural improvements and changes.', 10),
    (20, N'Serves as Payroll Department Project Manager for strategic projects.', 11),
    (20, N'Responsible for data necessary to complete government compliance activities and audits, coordinating data collection and updating numerous reports for management. Assures processes and procedures are in place to capture and maintain consistent and accurate payroll-related data.', 12),
    (20, N'Responsible for complex / tier 3 issue resolution and customer service.', 13),
    (20, N'Adheres to regular and predictable attendance.', 14),
    (20, N'Performs ad hoc reporting and other projects and tasks as designated by Manager of Payroll.', 15),
    (21, N'The position will interpret clinic and hospital financial data requests and design queries and reports to display the data to best support the salary administration process and to meet the end users'' expectations. A clear understanding of clinic and hospital functions, medical terminology, and a technical knowledge of the clinic and hospital financial systems and relational database products will be necessary to complete this function.', 1),
    (21, N'The position will download data from financial and clinical data systems into other software products. Once the data is in these products, the position will manipulate the information to prepare final reports and perform analyses.', 2),
    (21, N'The position will track clinic and hospital financial data requests, create methods to generate reports on a scheduled basis, ensure that report distribution is completed on a scheduled basis. The position will work with the information systems department to create portals for reporting.', 3),
    (21, N'The position will design and maintain databases which receive data from other systems. The position will create and maintain historical data bases containing billing, RVU, patient visit, and salary data. An understanding of how relational databases work will be mandatory.', 4),
    (21, N'The position will develop an understanding of the physician compensation process and the various external regulations that govern it. The position will support the department’s work with executive committee in all matters relating to salary administration', 5),
    (21, N'The position will respond to questions from department chairs and the medical and associate staff related to production and salary information. It will investigate data irregularities and determines causes. The position will also respond to questions from lay and medical management.', 6),
    (21, N'This position will identify billing errors. It will work closely with Revenue Cycle Department to resolve billing and RVU discrepancies.', 7),
    (21, N'This position will present data reflecting analyses performed. It will ensure customers are satisfied with data and that data meets users'' needs.', 8),
    (21, N'The position will validate data and confirm the accuracy of all reports produced. The creation of highly accurate reports is a fundamental requirement of the job.', 9),
    (21, N'The position requires viewing of clinical systems (e.g. Epic, lab, radiology, TEC) in order to validate information for reporting and establish financial systems. This can involve seeing patient specific information.', 10),
    (21, N'This position will perform other projects and duties as required.', 11),
    (21, N'Adheres to regular and predictable attendance.', 12),
    (22, N'Consults with Executive Committee. Serves as liaison to physician leadership in physician compensation design, evaluation changes, or interpretations of compensation plans or amendments', 1),
    (22, N'Keeps abreast of trends in physician compensation marketplace, including change from volume to value, and proposes changes to current physician compensation plans to keep pace with the market within legal and regulatory requirements.', 2),
    (22, N'Performs financial modeling on new and existing design to ensure plans meet objectives, financials and are compliant.', 3),
    (22, N'Consults with leadership across the organization and Executive Committee on the development of new roles and department structure changes for Physician comp or physician/APP.', 4),
    (22, N'Serves as the subject matter expert in providing information on market trends and pay strategies that impact Physician compensation.', 5),
    (22, N'Partners with executive leadership to determine which market surveys to participate in. Oversees interpretation of survey results to ensure competitive position regarding benchmark jobs and the local, regional, and national markets.', 6),
    (22, N'Serves as a project lead in the development and delivery of communication and training related to compensation.', 7),
    (22, N'Partner in the development and implementation of new policies, consulting with Executive Committee and leadership throughout the organization, and provides input and oversight into the updating of existing policies.', 8),
    (22, N'Partner with Physician recruitment on more complex compensation offers for Clinician staff consulting with the Manager as needed.', 9),
    (22, N'Makes recommendations for the continuous quality improvement strategies for Physician compensation programs.', 10),
    (22, N'Adheres to regular and predictable attendance.', 11),
    (23, N'Drives continuous improvements to HR processes, technology and data with the goal of providing robust HR services to support strategy.', 1),
    (23, N'Proactively identify opportunities to drive greater organizational impact by creating and evolving tools and infrastructure to support physician compensation programs.', 2),
    (23, N'Consistently foster intelligence in physician compensation and propose changes to compensation strategy and models to maintain market competitiveness and regulatory compliance.', 3),
    (23, N'Consults with customers and stakeholders to design and prototype solutions that effectively leverage data and related tools to advance business objectives.', 4),
    (23, N'Actively participates as a subject matter expert in physician compensation and related technology projects and upgrades including analysis, testing and implementation.', 5),
    (23, N'Design, develop, implement, and maintain physician compensation related pay plans, reporting/BI solutions, metrics, and dashboards, including documentation, as appropriate.', 6),
    (23, N'Support HR data & reporting governance processes and ensure applicable governance standards are followed.', 7),
    (23, N'Adheres to regular and predictable attendance.', 8),
    (23, N'Performs other duties as assigned.', 9),
    (24, N'Educate active and inactive plan participants on their rights and options under qualified and non-qualified retirement plans, including 401(k) and 457 (b) deferral calculations and distribution options.', 1),
    (24, N'Explain retirement benefit policies, procedures, and legal requirements to employees and beneficiaries.', 2),
    (24, N'Ensure employees understand retirement plan benefits, enrollment periods, investment choices, and consequences of elections or waivers.', 3),
    (24, N'Calculate maximum 401(k) and 457(b) income deferral allowed under the Internal Revenue Code based on age and covered compensation.', 4),
    (24, N'Conduct calculations and analysis related to retirement benefits, including service repurchase and contribution withdrawals.', 5),
    (24, N'Research and recommend appropriate benefits plans and services based on data analysis.', 6),
    (24, N'Conduct group presentations and individual meetings regarding retirement options.', 7),
    (24, N'Acquire and distribute relevant information and documentation to plan participants and beneficiaries.', 8),
    (24, N'Maintain records for participants and beneficiaries, including active, deferred, retired, and separated members.', 9),
    (24, N'Serve as a liaison for beneficiaries and participants, facilitating requests for contribution adjustments and refunds.', 10),
    (24, N'Coordinate with actuaries, plan administrators, and other professionals to provide verified data for benefits administration.', 11),
    (24, N'Ensure accuracy of benefits enrollments in the HRIS and respond to inquiries from employees and managers.', 12),
    (24, N'Assist with open enrollment for retiree insurance and retirement plans.', 13),
    (24, N'Ensure compliance with company, state, and federal regulations regarding retirement plans.', 14),
    (24, N'Coordinate annual retirement plan audits and prepare necessary documentation.', 15),
    (24, N'Compute plan contributions at year-end and assist with communication to employees.', 16),
    (24, N'Provide scheduled reports to the recordkeeper on employee eligibility and status changes.', 17),
    (24, N'Monitor employees on Military Leave and communicate with returning employees regarding contributions.', 18),
    (24, N'Review and update retirement plan information on internal sites.', 19),
    (24, N'Adhere to regular attendance and perform other duties as assigned.​', 20),
    (26, N'1.0 Organizational Strategy and Implementation -- Understanding market trends and the impact on their AOR, contributing to AOR strategic and operational plans.', 1),
    (26, N'2.0 Fiscal Management -- Effectively using established processes to ensure accountability for effective operations and resource management.', 2),
    (26, N'3.0 Human Resource Management -- Effectively using established processes to: select, align, engage, develop, manage, and retain a team of highly skilled staff.', 3),
    (26, N'4.0 Excellence in Service and Clinical Quality -- Achieving seamless delivery of quality patient care and safety, excellence in patient experience and customer service.', 4),
    (26, N'5.0 Organizational Leadership -- Providing leadership and accomplishing objectives by supporting the integration of processes and initiatives while modeling collaboration.', 5),
    (27, N'The VP is responsible for proactively identifying external forces and trends, for anticipating their impact, for ensuring effective response from their AOR (area-of-responsibility), and for influencing the System as a whole. The VP collaborates with senior management and others to establish and achieve strategic goals to further the mission and vision.', 1),
    (27, N'Total Rewards Strategy and Design: Develop and execute a total rewards strategy that supports the company''s business goals and ensures competitive and affordable compensation and benefits programs for our employees. Develop and oversee governance structures to facilitate effective decision making and plan oversight. Design and implement innovative compensation programs, including base salary structures, variable pay plans, incentives and recognition programs. Design and implement innovative benefits programs, including health and welfare, wellness, retirement, time off, leave of absence, education. Collaborate with the Chief People Officer (CPO) and executive leadership team to ensure total rewards initiatives are aligned with the company''s overall HR and business strategies. Ensure competitiveness of compensation structures and benefit offerings in different markets, taking into account local regulations, industry benchmarks and organization financials.', 2),
    (27, N'Data-Driven Decision Making and Innovation: Leverage HR data analytics to connect data with business needs, providing insights that drive informed decision-making and continuous improvement. Identify and implement creative and effective solutions to enhance the overall employee experience, ensuring our reward and performance programs are competitive. Drive innovative solutions to enhance the overall employee experience, with a focus on attracting, retaining, and motivating top talent. Collaborate with cross-functional teams to integrate Total Rewards initiatives seamlessly into broader HR and business strategies and meet budget targets.', 3),
    (27, N'Collaboration and Communication: Collaborate with cross-functional teams to ensure alignment between HR initiatives and organizational goals. Develop and maintain relationships with internal customers, peers and associates as well as external vendors. Tailor messages and use appropriate communication methods to build and maintain trust across diverse audiences. Utilize Workday, Infor and UKG (Ultimate Kronos Group) or similar platforms to optimize the employee experience and administrative processes related to compensation, benefits, and payroll. Stay abreast of market trends, legislative changes, and emerging best practices in Total Rewards to continuously enhance the company''s programs.', 4),
    (27, N'Payroll and Benefits Management: Oversee the management of payroll operations, ensuring accurate and timely processing of payroll across multiple locations, in compliance with local regulations and company policies. Manage and enhance the benefits portfolio, including health and welfare programs, leave programs, retirement plans, employee wellness initiatives, and other benefits offerings. Evaluate and select external vendors and partners for payroll processing and benefits administration, negotiating contracts and service level agreements to ensure cost-effectiveness and quality service delivery. Responsible for ongoing relationship and contract management.', 5);

/* ---------------------------------------- essential_functions_ai */
INSERT INTO dbo.essential_functions_ai (job_id, function_text, sort_order) VALUES
    (1, N'Compile, analyze, and report employee, benefit plan, and financial data to support strategic planning, evaluation, best practices, and benchmark surveys for benefits.', 1),
    (1, N'Provide guidance and counsel to employees, HRIS representatives, and managers on benefit program requirements and provisions.', 2),
    (1, N'Coordinate open enrollment communication and design annual benefit enrollment materials to educate employees about benefit offerings.', 3),
    (1, N'Inform and educate management and employees about changes to benefit plans, administrative practices, and legislated requirements.', 4),
    (1, N'Collaborate with vendors, carriers, and consultants to prepare bid specifications and RFPs, analyze proposals and renewals, interpret contracts, and manage vendor performance.', 5),
    (1, N'Design and continuously improve business processes and workflows that leverage technology to enhance employee experience and reduce manual work.', 6),
    (1, N'Manage data collection and reporting necessary for government compliance activities, employee communications, vendor billings, and management reports, ensuring accuracy and consistency.', 7),
    (1, N'Monitor plan limits, eligibility, and participation restrictions to ensure compliance with plan provisions and government regulations, including maintaining legal compliance documentation.', 8),
    (1, N'Research current benefit trends and regulatory requirements to recommend program changes to the Manager of Benefits.', 9),
    (1, N'Resolve complex benefit issues and provide tier 3 customer service support.', 10),
    (1, N'Maintain regular and predictable attendance.', 11),
    (1, N'Other duties as assigned.', 12),
    (2, N'Serve as the primary contact for candidates to communicate employee benefits during recruitment and onboarding.', 1),
    (2, N'Educate new employees on benefits options, enrollment procedures, and timelines to facilitate smooth onboarding.', 2),
    (2, N'Collaborate with HR and talent acquisition teams to integrate benefits communication into onboarding strategies.', 3),
    (2, N'Provide personalized counseling to employees on retirement benefits, plans, and available resources.', 4),
    (2, N'Assist retiring employees with understanding benefits, healthcare options, and required documentation.', 5),
    (2, N'Develop and deliver educational materials, presentations, and workshops on employee benefits and retirement planning.', 6),
    (2, N'Maintain current knowledge of company benefits programs, policies, and regulatory requirements.', 7),
    (2, N'Build and maintain strong relationships with employees and candidates to ensure clear and trusted benefits communication.', 8),
    (2, N'Track, analyze, and report on benefits education activities and employee engagement metrics.', 9),
    (2, N'Identify opportunities to improve benefits education and communication processes.', 10),
    (2, N'Support HR initiatives related to benefits enrollment and employee engagement.', 11),
    (2, N'Coordinate with benefits providers to resolve employee inquiries and issues.', 12),
    (2, N'Other duties as assigned.', 13),
    (3, N'Answer department telephone calls and respond to employee requests for information regarding benefits.', 1),
    (3, N'Use computer programs to prepare documents, reports, and generate data on benefits utilization and trends for leadership review.', 2),
    (3, N'Assist and direct customers by providing support and resolving benefits-related issues and concerns.', 3),
    (3, N'Maintain employee records and administer benefits programs, including enrollment, changes, terminations, and coordination of PTO buy-back and file shuffle processes.', 4),
    (3, N'Manage scanning, updating, and auditing of employee personnel and health files to ensure accuracy and compliance.', 5),
    (3, N'Coordinate and communicate benefits information through presentations, meetings, written materials, and timely benefit communications throughout the year.', 6),
    (3, N'Extract, compile, and process data for regular and ad hoc reporting, including FMLA weekly reports and monthly audits.', 7),
    (3, N'Manage and update new hire orientation materials related to employee benefits.', 8),
    (3, N'Interpret plan provisions, coordinate application of benefits, and assist in planning benefit changes.', 9),
    (3, N'Ensure compliance with federal and state regulations related to employee benefits and utilize information systems to their full capability.', 10),
    (3, N'Attend regularly scheduled and assigned shifts to fulfill departmental duties.', 11),
    (3, N'Perform other duties as assigned.', 12),
    (4, N'Answer department telephone and respond promptly to requests for information while assisting and directing customers effectively.', 1),
    (4, N'Manage employee benefits assignments and projects, including processing benefit changes, maintaining automated systems, and overseeing eligibility for health, dental, vision, and other insurance plans.', 2),
    (4, N'Interpret plan provisions and counsel employees on benefits options, rights, and problem resolution, including individual consultations for retirement, disability claims, and COBRA coverage.', 3),
    (4, N'Plan and conduct employee benefit presentations, orientations, and education sessions for new hires, open enrollment, and one-on-one meetings.', 4),
    (4, N'Administer leave programs such as medical, personal, military, FMLA, Wisconsin Leave, and ADA, ensuring compliance with federal and state regulations.', 5),
    (4, N'Coordinate and oversee third-party administrators for Medical and Dependent Care Reimbursement accounts, ensuring compliant and timely claim payments aligned with payroll deadlines.', 6),
    (4, N'Collaborate with carriers and vendors to resolve coverage and benefit issues, maintain relationships, review offerings, and implement necessary changes.', 7),
    (4, N'Maintain and update benefits websites, written materials, and summary plan descriptions in partnership with health plans and insurance carriers to ensure accuracy and compliance.', 8),
    (4, N'Process and oversee 401(k) hardship and in-service distributions, support retirement processes, coordinate retiree eligibility, and manage retiree/COBRA health plan enrollment.', 9),
    (4, N'Complete monthly reconciliation of benefits billing, audit carrier invoices, submit payments, and monitor changes in government benefit regulations such as Health Care Reform and IRS rules.', 10),
    (4, N'Participate in organizational committees to promote employee wellness and assist in implementing new benefit programs or changes by managing surveys, payroll data, communications, and education.', 11),
    (4, N'Coordinate the annual benefits renewal and open enrollment processes, including strategy development, timeline establishment, data summarization, enrollment transfer, and employee communication.', 12),
    (4, N'Other duties as assigned.', 13),
    (6, N'Analyze market pricing for leadership and staff job descriptions to determine appropriate pay levels and exemption status.', 1),
    (6, N'Maintain the market-pricing system, coordinate participation in compensation surveys, complete surveys, review results, and compile comparison summaries to support pay decisions.', 2),
    (6, N'Conduct auditing and non-discrimination testing for compensation programs to ensure compliance with regulatory guidance.', 3),
    (6, N'Assist with job architecture setup, maintenance, and testing within the HRIS system.', 4),
    (6, N'Administer the annual salary increase process and manage step increase administration with accuracy and efficiency.', 5),
    (6, N'Perform regular audits of compensation data and programs to verify accuracy and compliance.', 6),
    (6, N'Support research, development, and implementation of total compensation programs, including pay for performance, leadership, executive compensation, and variable pay such as shift differentials and incentives.', 7),
    (6, N'Monitor current and pending legislation and regulatory guidelines related to compensation and communicate findings and recommendations.', 8),
    (6, N'Compile and maintain comprehensive documentation of compensation processes and procedures.', 9),
    (6, N'Adhere to regular and predictable attendance.', 10),
    (6, N'Other duties as assigned.', 11),
    (7, N'Consult with HR business partners, organizational leadership, and compensation staff to identify compensation needs and design new programs aligned with organizational goals.', 1),
    (7, N'Partner with the compensation team to conduct ongoing analysis, research, and statistical modeling of compensation data, providing recommendations to address emerging business requirements and workforce pay-related issues.', 2),
    (7, N'Monitor external compensation trends regularly and propose ideas for implementing new or revised compensation programs.', 3),
    (7, N'Lead the communication and coordination of the annual compensation process, ensuring deadlines are met in partnership with the compensation team.', 4),
    (7, N'Collaborate with leadership and HR business partners to develop new roles and restructure departments as needed.', 5),
    (7, N'Lead and oversee the job evaluation process by assigning requests, ensuring accurate job analysis, determining market approaches, reviewing exemption status and pay grade decisions, and ensuring timely completion.', 6),
    (7, N'Manage and maximize the functionality of the Payfactors system in compensation-related tasks.', 7),
    (7, N'Develop, lead, and deliver training programs related to compensation while providing guidance, assigning work, and training compensation staff to support department objectives.', 8),
    (7, N'Collaborate in developing and implementing new compensation policies and provide input and oversight on updates to existing policies.', 9),
    (7, N'Partner with recruitment on complex compensation offers for staff and leadership roles, consulting with management as needed.', 10),
    (7, N'Recommend continuous quality improvement strategies to enhance the effectiveness of compensation programs.', 11),
    (7, N'Other duties as assigned.', 12),
    (8, N'Design, manage, and analyze a variety of benefits programs and policies including health and welfare, wellness, retirement, tuition, leave of absence, and time off, incorporating budgeting, strategy, and competitive analysis.', 1),
    (8, N'Apply expertise in benefits administration concepts, compliance requirements, and regulatory frameworks to current and future program design and management.', 2),
    (8, N'Conduct deep analytical assessments by breaking down complex data and questions into structured analyses, synthesizing key points, and providing financial business cases as needed.', 3),
    (8, N'Manage multiple concurrent programs, processes, and initiatives by collaborating with and influencing diverse stakeholders while maintaining an end-to-end perspective on implementation.', 4),
    (8, N'Negotiate and manage vendor contracts to ensure effective service delivery and program support.', 5),
    (8, N'Develop and deliver formal and informal reports, presentations, and communications tailored to executive audiences.', 6),
    (8, N'Lead transformational initiatives to mature the human resource function, align with workforce strategies, and drive program excellence and strategic impact.', 7),
    (8, N'Inspire and motivate employees to exceed expectations and work collaboratively toward a shared organizational vision.', 8),
    (8, N'Oversee compliance with applicable regulations and governing bodies to mitigate risk and ensure program integrity.', 9),
    (8, N'Monitor and evaluate program performance to identify opportunities for continuous improvement and business value creation.', 10),
    (8, N'Foster strong customer service orientation within benefits programs to enhance employee experience and satisfaction.', 11),
    (8, N'Utilize strategic thinking to align benefits programs with organizational goals and workforce needs.', 12),
    (8, N'Other duties as assigned.', 13),
    (9, N'Design, develop, and manage diverse compensation programs and processes, including base salary, variable pay, budgeting, strategy, and competitive pay analysis.', 1),
    (9, N'Conduct comprehensive market research, modeling, and analysis using a full range of compensation methodologies and tools.', 2),
    (9, N'Synthesize complex data and questions into clear, well-structured recommendations supported by financial business cases.', 3),
    (9, N'Apply knowledge of regulations and governing bodies to the design and administration of current and future compensation programs.', 4),
    (9, N'Manage multiple compensation programs, processes, and initiatives while collaborating with and influencing diverse stakeholders.', 5),
    (9, N'Utilize advanced Microsoft Excel skills and other analytical tools to support compensation analysis and decision-making.', 6),
    (9, N'Design and administer job architecture and compensation within HR systems, including Workday.', 7),
    (9, N'Develop and deliver formal and informal reports, presentations, and communications tailored to executive audiences.', 8),
    (9, N'Lead transformational initiatives aligned with workforce strategies to mature HR functions, enhance customer service, and create business value.', 9),
    (9, N'Inspire and motivate employees to exceed expectations and work collaboratively toward a shared organizational vision.', 10),
    (9, N'Drive program excellence and strategic impact through accountable leadership in compensation management.', 11),
    (9, N'Other duties as assigned.', 12),
    (10, N'Serve as the primary contact for employees and managers by providing clear guidance on leave eligibility, documentation requirements, timelines, and return-to-work procedures.', 1),
    (10, N'Respond promptly to HR Service Center inquiries and tickets by delivering accurate guidance and resolving leave-related questions.', 2),
    (10, N'Gather, complete, and manage all required paperwork and medical certification processes to determine leave eligibility.', 3),
    (10, N'Administer the entire leave process from initial notice through employee return to work, monitoring and tracking timelines for timely follow-up.', 4),
    (10, N'Manage the scanning, organization, and maintenance of confidential employee personnel and health records within HRIS and related systems.', 5),
    (10, N'Process, audit, and generate monthly leave reports to ensure data accuracy, integrity, and compliance with policies.', 6),
    (10, N'Collaborate with HR, management, and relevant departments to facilitate smooth leave administration and compliance with organizational policies.', 7),
    (10, N'Communicate effectively with employees and managers to address leave-related concerns and provide ongoing support.', 8),
    (10, N'Attend regularly scheduled and assigned shifts to support leave benefits operations and maintain operational continuity.', 9),
    (10, N'Continuously update knowledge of leave regulations and organizational policies to provide informed and current guidance.', 10),
    (10, N'Utilize HRIS systems to maintain data integrity and support reporting related to leave benefits.', 11),
    (10, N'Maintain regular and predictable attendance to support operational needs.', 12),
    (10, N'Other duties as assigned.', 13),
    (11, N'Communicate with employees to explain leave requirements, responsibilities, and necessary documentation for eligibility.', 1),
    (11, N'Respond promptly to HR Service Center inquiries by providing accurate guidance and resolution on leave-related matters.', 2),
    (11, N'Administer the entire leave process from initial notice through return to work, including collecting paperwork, determining eligibility, and managing medical certifications.', 3),
    (11, N'Adjudicate leave requests in compliance with applicable leave laws and organizational policies.', 4),
    (11, N'Maintain ongoing communication with employees on leave to support their transition back to work and facilitate information flow between employees and managers.', 5),
    (11, N'Advise leaders and employees on coordinating leave laws with paid time off, workers'' compensation, and disability benefits.', 6),
    (11, N'Monitor and track all leave types in organizational systems to ensure accurate reporting and regulatory compliance.', 7),
    (11, N'Audit leave records regularly to verify accuracy and adherence to company policies and legal requirements.', 8),
    (11, N'Educate employees and managers on leave policies, procedures, and best practices.', 9),
    (11, N'Deliver all job duties with a high level of customer service and empathy toward employees utilizing leave benefits.', 10),
    (11, N'Collaborate with Employee Health and HR Business Partners to manage complex leave cases effectively.', 11),
    (11, N'Attend all scheduled shifts and perform other job-related responsibilities as assigned.', 12),
    (11, N'Other duties as assigned.', 13),
    (12, N'Develop, implement, and administer leave programs to manage absences and ensure compliance with applicable federal and state laws.', 1),
    (12, N'Communicate with employees regarding leave eligibility, responsibilities, and required documentation to facilitate understanding and compliance.', 2),
    (12, N'Manage the entire leave administration process from initial notice through return to work, including gathering paperwork, determining eligibility, and handling medical certifications.', 3),
    (12, N'Maintain ongoing communication with employees on leave and their managers to support a smooth return to work and effective information flow.', 4),
    (12, N'Advise management and employees on the interaction of leave laws with paid time off, workers'' compensation, and disability benefits to ensure coordinated leave management.', 5),
    (12, N'Interpret and apply leave policies and programs in accordance with legal requirements, and develop policies and procedures to promote compliance and best practices.', 6),
    (12, N'Monitor, track, and report all leave types in organizational systems to ensure accuracy and adherence to internal and external policies.', 7),
    (12, N'Partner with HR representatives to manage Family Medical Leave and other leave types, ensuring proper documentation and tracking.', 8),
    (12, N'Design and maintain user-friendly, compliant leave processes that minimize manual entry and enhance efficiency.', 9),
    (12, N'Evaluate the quality of leave processes and customer service by identifying key metrics, tracking performance, and recommending improvements.', 10),
    (12, N'Produce and analyze reporting metrics and analytics for leave cases, and present findings to relevant stakeholders as needed.', 11),
    (12, N'Collaborate with Employee & Labor Relations, Legal, and Total Rewards leadership to stay informed on new and changing leave laws and regulations.', 12),
    (12, N'Other duties as assigned.', 13),
    (13, N'Manage diverse benefits programs and policies including health and welfare, wellness, tuition, leave of absence, and time off, overseeing budgeting, administration, and regulatory compliance.', 1),
    (13, N'Oversee the annual open enrollment process, including planning and executing communications to employees.', 2),
    (13, N'Administer and optimize benefits administration tools and technology to deliver efficient, effective, and compliant solutions.', 3),
    (13, N'Set annual premium and cost-sharing rates in collaboration with finance and key stakeholders.', 4),
    (13, N'Manage relationships with service providers, ensuring performance meets agreed standards and participate in contract negotiation and finalization.', 5),
    (13, N'Develop and deliver formal and informal reports, presentations, and communications to leadership to support decision-making.', 6),
    (13, N'Partner regularly with finance and other departments to manage budgets and implement cost savings and containment strategies.', 7),
    (13, N'Ensure compliance with ERISA, DOL, IRS, and other regulatory requirements, including plan document maintenance, government filings, and required notices.', 8),
    (13, N'Utilize expertise in HR database applications and benefits management tools to support program administration.', 9),
    (13, N'Lead and develop a team, fostering strong people management and communication skills.', 10),
    (13, N'Direct and coordinate projects related to benefits programs and initiatives.', 11),
    (13, N'Apply creative problem-solving skills to address challenges and improve benefits operations.', 12),
    (13, N'Other duties as assigned.', 13),
    (14, N'Lead and manage annual compensation cycles to ensure fair, competitive practices and provide guidance on market fluctuations and budget considerations.', 1),
    (14, N'Develop and maintain complex financial models to budget, forecast compensation costs, analyze scenarios, and support strategic decision-making.', 2),
    (14, N'Design and deliver compensation analytics to evaluate program effectiveness, identify trends, and recommend adjustments aligned with enterprise goals.', 3),
    (14, N'Collaborate with finance to administer budgeting and forecasting processes, ensuring compensation expenses align with financial goals and constraints.', 4),
    (14, N'Utilize advanced data analytics and compensation expertise to solve complex issues related to compensation trends, pay equity, and market competitiveness, presenting findings to senior leadership.', 5),
    (14, N'Lead compensation benchmarking efforts by comparing practices against industry standards and leveraging technology to recommend adjustments.', 6),
    (14, N'Ensure compliance with relevant laws and regulations by conducting audits and risk assessments to identify and mitigate potential issues.', 7),
    (14, N'Provide insights and recommendations on compensation trends, cost implications, and adjustments to maintain market competitiveness in collaboration with leadership.', 8),
    (14, N'Collaborate with cross-functional and enterprise teams to align compensation strategies with business objectives and market trends.', 9),
    (14, N'Build and maintain relationships with internal and external stakeholders to gather feedback, extend insights, and strengthen compensation program cohesion.', 10),
    (14, N'Drive change by coordinating integrated communication and learning initiatives related to compensation program principles.', 11),
    (14, N'Other duties as assigned.', 12),
    (15, N'Analyze market trends and their impact on the area of responsibility (AOR) to contribute to strategic and operational planning, translating plans into actionable objectives and securing staff alignment and commitment.', 1),
    (15, N'Manage fiscal resources by applying established processes to ensure accountability and effective operations.', 2),
    (15, N'Select, develop, engage, manage, and retain a skilled team by utilizing established human resource management processes.', 3),
    (15, N'Lead efforts to deliver seamless, high-quality patient care and safety while enhancing patient experience and customer service.', 4),
    (15, N'Provide organizational leadership by integrating processes and initiatives, modeling collaboration, and achieving set objectives.', 5),
    (15, N'Other duties as assigned.', 6),
    (16, N'Analyze market trends and translate strategic and operational plans to ensure alignment and commitment within the area of responsibility (AOR).', 1),
    (16, N'Manage resources and operations effectively by adhering to established fiscal processes and accountability standards.', 2),
    (16, N'Select, develop, engage, and retain a highly skilled team through effective human resource management practices.', 3),
    (16, N'Deliver seamless, high-quality patient care and safety while promoting excellence in patient experience and customer service.', 4),
    (16, N'Provide leadership that integrates processes and initiatives, fosters collaboration, and achieves organizational objectives.', 5),
    (16, N'Other duties as assigned.', 6),
    (17, N'Develop and manage the annual retirement and savings benefits budget and accrual, adjusting the operating budget as needed.', 1),
    (17, N'Prepare, communicate, and educate employees on changes in benefits, policies, and practices within the organization.', 2),
    (17, N'Innovate and recommend improvements to retirement plans and financial well-being programs to enhance employee engagement and program effectiveness.', 3),
    (17, N'Measure and assess the effectiveness of retirement benefits to drive plan design, innovation, and targeted employee communication campaigns.', 4),
    (17, N'Ensure full compliance with IRS, ERISA, and other federal laws and regulations governing U.S. retirement plans.', 5),
    (17, N'Manage and chair administrative committees responsible for fiduciary and governance oversight of retirement plans.', 6),
    (17, N'Provide plan metrics, compliance updates, and program change recommendations to senior executives and governing committees.', 7),
    (17, N'Collaborate with Communications and cross-functional teams to develop strategies that help employees maximize retirement and financial well-being benefits.', 8),
    (17, N'Maintain accuracy and compliance of legal retirement plan documents in alignment with administrative processes and employee communications.', 9),
    (17, N'Inform stakeholders, including senior leaders, of new and pending legislation, regulations, and reporting requirements affecting retirement plans and participants.', 10),
    (17, N'Assess, benchmark, and hold service providers accountable for delivering contracted services and meeting performance standards.', 11),
    (17, N'Coordinate with ERISA attorneys, investment consultants, and other professionals to support plan compliance and governance.', 12),
    (17, N'Provide strategic guidance on technology needs and data flow requirements to support retirement programs.', 13),
    (17, N'Lead and develop strong people management and communication skills while directing and coordinating projects.', 14),
    (17, N'Other duties as assigned.', 15),
    (18, N'Drive continuous improvements to timekeeping and payroll processes, HR technology, and data management to enhance efficiency in payroll administration.', 1),
    (18, N'Identify opportunities to increase organizational impact through data analytics and insights.', 2),
    (18, N'Consult with customers and stakeholders to design and prototype data-driven solutions that advance timekeeping and payroll insights and identify risks.', 3),
    (18, N'Lead timekeeping and payroll projects and collaborate on enterprise solution upgrades, including analysis, testing, and implementation.', 4),
    (18, N'Design, develop, implement, and maintain timekeeping and payroll reports and dashboards for diverse stakeholders.', 5),
    (18, N'Support HR data and reporting governance processes and ensure compliance with governance standards.', 6),
    (18, N'Mentor and provide technical guidance and support to team members.', 7),
    (18, N'Maintain regular and predictable attendance.', 8),
    (18, N'Other duties as assigned.', 9),
    (19, N'Prepare, audit, analyze, and correct timekeeping data to process hourly and salaried payroll, including coordinating special payroll runs outside regular schedules.', 1),
    (19, N'Review payroll computations and interpret company policies and governmental regulations to ensure accurate payroll processing and recommend process improvements.', 2),
    (19, N'Create and maintain timekeeping systems for absence management plans, audit employee enrollment, transfer employees between plans, and calculate cash-out amounts for terminations, retirements, or in-service options.', 3),
    (19, N'Reconcile and balance payroll for electronic transfers to employees and tax authorities, ensuring compliance and timely reporting of payroll accounts and garnishments to federal, state, and local agencies.', 4),
    (19, N'Maintain payroll and timekeeping systems in collaboration with HRIS staff, including setting up security access, creating job and pay codes, and recommending system improvements during upgrades and testing.', 5),
    (19, N'Provide prompt and accurate customer service to employees and managers regarding timekeeping and payroll inquiries in partnership with the Help Desk.', 6),
    (19, N'Prepare, reconcile, and distribute W2 reports to employees and government agencies, calculate taxable fringe benefits, and record imputed income for year-end processing.', 7),
    (19, N'Participate in system upgrades, new application implementations, process improvements, system integration, and testing projects, collaborating with HRIS, management, and IS teams to automate HR processes and resolve issues.', 8),
    (19, N'Develop and conduct new employee orientation, user group meetings, leader presentations, and other communication and education efforts in coordination with management.', 9),
    (19, N'Collaborate with HRIS staff to create and write audit reports for internal departmental use and management tools.', 10),
    (19, N'Adhere to regular and predictable attendance requirements.', 11),
    (19, N'Assist the department with special projects as assigned.', 12),
    (19, N'Other duties as assigned.', 13),
    (20, N'Analyze, audit, reconcile, and resolve complex time administration, payroll processing, and employee payroll issues to ensure accurate and timely payroll execution.', 1),
    (20, N'Manage tax and regulatory reporting, quarter-end and year-end payroll activities, reconciliations, and W2 processing in compliance with federal and state wage and hour laws, unemployment, and other tax requirements.', 2),
    (20, N'Research and interpret regulatory requirements, resolve payroll, timekeeping, tax, garnishment, and taxable fringe benefit issues, and recommend changes to payroll policies based on regulatory updates.', 3),
    (20, N'Oversee multi-state payroll tax setup, issue resolution, and tax notice management in partnership with ADP Smart Compliance, including establishing new state withholding, unemployment, and tax accounts as needed.', 4),
    (20, N'Coordinate payroll accounting by recording, correcting, and reconciling payroll expenses, mandated taxes, liabilities, and corrections, collaborating with Accounting and Treasury departments.', 5),
    (20, N'Prepare and review payroll accounting journal entries and monthly payroll account reconciliations, including intercompany payroll transactions, ensuring compliance with generally accepted accounting principles.', 6),
    (20, N'Participate in interim and annual financial audits related to payroll processes and controls.', 7),
    (20, N'Provide guidance and counsel to employees, HRIS representatives, and managers on wage and hour laws, wage and overtime calculations, payroll tax regulations, and garnishment requirements.', 8),
    (20, N'Design and continuously improve payroll business processes and workflows to enhance employee experience, increase efficiency, and reduce manual work through technology.', 9),
    (20, N'Perform payroll system testing for enhancements and upgrades, validate functionality, and recommend and implement system and procedural improvements in collaboration with HR, HRIS, Accounting, and Finance.', 10),
    (20, N'Serve as Payroll Department Project Manager for strategic projects, overseeing planning and execution.', 11),
    (20, N'Manage data collection and reporting for government compliance activities and audits, ensuring consistent and accurate payroll-related data capture and maintenance.', 12),
    (20, N'Other duties as assigned.', 13),
    (21, N'Interpret clinic and hospital financial data requests and design queries and reports to support the salary administration process and meet end users'' expectations.', 1),
    (21, N'Download data from financial and clinical systems, manipulate information in software products, and prepare final reports and analyses.', 2),
    (21, N'Track financial data requests, develop methods for scheduled report generation and distribution, and collaborate with information systems to create reporting portals.', 3),
    (21, N'Design and maintain databases that integrate data from multiple systems, including historical billing, RVU, patient visit, and salary data.', 4),
    (21, N'Develop expertise in the physician compensation process and relevant external regulations to support executive committee activities related to salary administration.', 5),
    (21, N'Respond to inquiries from department chairs, medical and associate staff, and management regarding production and salary data, investigating and resolving data irregularities.', 6),
    (21, N'Identify billing errors and collaborate with the Revenue Cycle Department to resolve billing and RVU discrepancies.', 7),
    (21, N'Present analytical data to stakeholders, ensuring customer satisfaction and alignment with user needs.', 8),
    (21, N'Validate data accuracy and ensure the production of highly accurate reports.', 9),
    (21, N'Access clinical systems to validate information for reporting and financial system establishment, including patient-specific data when necessary.', 10),
    (21, N'Maintain regular and predictable attendance to fulfill job responsibilities.', 11),
    (21, N'Other duties as assigned.', 12),
    (22, N'Consult with the Executive Committee and physician leadership to design, evaluate, and interpret physician compensation plans and amendments.', 1),
    (22, N'Monitor physician compensation market trends, including shifts from volume to value, and propose plan changes to align with market conditions and regulatory requirements.', 2),
    (22, N'Perform financial modeling on new and existing compensation designs to ensure alignment with objectives, financial targets, and compliance standards.', 3),
    (22, N'Collaborate with organizational leadership and the Executive Committee to develop new roles and restructure departments related to physician and advanced practice provider compensation.', 4),
    (22, N'Serve as the subject matter expert on market trends and pay strategies affecting physician compensation.', 5),
    (22, N'Partner with executive leadership to select market surveys, interpret survey results, and maintain competitive positioning for benchmark jobs across local, regional, and national markets.', 6),
    (22, N'Lead projects to develop and deliver communication and training programs related to physician compensation.', 7),
    (22, N'Collaborate in the development and implementation of new compensation policies, providing input and oversight on updates in consultation with the Executive Committee and leadership.', 8),
    (22, N'Support physician recruitment by consulting on complex compensation offers for clinician staff in partnership with the recruitment manager.', 9),
    (22, N'Recommend continuous quality improvement strategies for physician compensation programs.', 10),
    (22, N'Maintain regular and predictable attendance.', 11),
    (22, N'Other duties as assigned.', 12),
    (23, N'Drive continuous improvements to HR processes, technology, and data to enhance HR services supporting organizational strategy.', 1),
    (23, N'Identify and develop tools and infrastructure to optimize physician compensation programs and increase organizational impact.', 2),
    (23, N'Analyze physician compensation intelligence and recommend strategic changes to maintain market competitiveness and regulatory compliance.', 3),
    (23, N'Consult with customers and stakeholders to design and prototype data-driven solutions that advance business objectives.', 4),
    (23, N'Serve as a subject matter expert in physician compensation and related technology projects, including analysis, testing, and implementation.', 5),
    (23, N'Design, develop, implement, and maintain physician compensation pay plans, reporting, business intelligence solutions, metrics, dashboards, and documentation.', 6),
    (23, N'Support HR data and reporting governance processes by ensuring adherence to governance standards.', 7),
    (23, N'Maintain regular and predictable attendance.', 8),
    (23, N'Other duties as assigned.', 9),
    (24, N'Educate active and inactive plan participants on their rights, options, and procedures under qualified and non-qualified retirement plans, including 401(k) and 457(b) deferral calculations and distribution choices.', 1),
    (24, N'Explain retirement benefit policies, legal requirements, enrollment periods, investment options, and consequences of elections or waivers to employees and beneficiaries.', 2),
    (24, N'Calculate maximum allowable 401(k) and 457(b) income deferrals based on age and covered compensation, and perform related benefit calculations such as service repurchase and contribution withdrawals.', 3),
    (24, N'Research, analyze, and recommend appropriate retirement benefit plans and services using relevant data.', 4),
    (24, N'Conduct group presentations and individual consultations to communicate retirement options and plan details effectively.', 5),
    (24, N'Acquire, distribute, and maintain accurate records and documentation for plan participants and beneficiaries across all membership statuses, and serve as a liaison to facilitate participant and beneficiary requests for contribution adjustments, refunds, and benefit inquiries.', 6),
    (24, N'Coordinate with actuaries, plan administrators, and other professionals to verify data and support benefits administration processes.', 7),
    (24, N'Ensure accuracy of benefits enrollments in the HRIS system, respond promptly to employee and manager inquiries, and assist with open enrollment processes for retiree insurance and retirement plans.', 8),
    (24, N'Ensure compliance with company policies and applicable state and federal regulations governing retirement plans.', 9),
    (24, N'Coordinate annual retirement plan audits, prepare required documentation, compute year-end plan contributions, and communicate relevant information to employees.', 10),
    (24, N'Monitor employees on Military Leave, communicate with returning employees regarding contributions, and update retirement plan information on internal platforms.', 11),
    (24, N'Other duties as assigned.', 12),
    (26, N'Analyze market trends and their impact on the area of responsibility to contribute to strategic and operational planning.', 1),
    (26, N'Manage fiscal resources by applying established processes to ensure accountability and effective operations.', 2),
    (26, N'Select, align, engage, develop, manage, and retain a skilled team using established human resource processes.', 3),
    (26, N'Deliver quality patient care and safety by promoting excellence in service and clinical quality.', 4),
    (26, N'Provide leadership that supports process integration and initiative accomplishment while modeling collaboration.', 5),
    (26, N'Other duties as assigned.', 6),
    (27, N'Develop and execute a total rewards strategy that aligns with business goals and delivers competitive, affordable compensation and benefits programs.', 1),
    (27, N'Design and implement innovative compensation and benefits programs, including salary structures, variable pay, incentives, recognition, health and welfare, wellness, retirement, leave, and education offerings.', 2),
    (27, N'Collaborate with executive leadership and the Chief People Officer to align total rewards initiatives with overall HR and business strategies.', 3),
    (27, N'Analyze HR data and leverage analytics to drive informed decision-making, continuous improvement, and innovative solutions that enhance the employee experience.', 4),
    (27, N'Lead efforts to attract, retain, and motivate top talent through competitive reward and performance programs.', 5),
    (27, N'Oversee payroll operations to ensure accurate, timely processing across multiple locations in compliance with regulations and company policies.', 6),
    (27, N'Manage and optimize the benefits portfolio, including health, welfare, leave, retirement, and wellness programs.', 7),
    (27, N'Evaluate, select, and negotiate contracts with external vendors and partners for payroll and benefits administration to ensure cost-effectiveness and quality service.', 8),
    (27, N'Develop and maintain strong relationships with internal stakeholders, peers, associates, and external vendors to support total rewards objectives.', 9),
    (27, N'Utilize HR platforms such as Workday, Infor, and UKG to optimize employee experience and administrative processes related to compensation, benefits, and payroll.', 10),
    (27, N'Monitor market trends, legislative changes, and best practices in total rewards to continuously enhance programs.', 11),
    (27, N'Collaborate cross-functionally to integrate total rewards initiatives with broader HR and organizational goals while meeting budget targets.', 12),
    (27, N'Other duties as assigned.', 13);

COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH
GO

SET NOEXEC OFF;
GO

