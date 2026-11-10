import { Request, Response, type Express } from "express";

import sql, { getPool } from "./dbSql";
import ldap, { SearchOptions } from "ldapjs";

import {
  checkRole,
  convertKeysToCamelCase,
  convertKeysToCamelCaseWithISO,
  hasRole,
  objectGUIDToUUID,
} from "./helper";
import dashboardRoutes from "./dashboard.routes";
import notificationRoutes from "./notification.routes";
import usersRoutes from "./users.routes";
import { JobFinalReview } from "@shared/jobs.schema";
import {
  RESET_REASON_MAX_LENGTH,
  isResettableStatus,
  resetTargetFor,
} from "@shared/job-status";
import {
  commentSectionKey,
  effectiveJobDescriptionSections,
  groupSectionChanges,
  isEditableSectionKey,
  jdSectionLabel,
  parseJobDescriptionSections,
} from "@shared/job-description-fields";
import XLSX from "xlsx";
// import sspi from "node-sspi";
import authMiddleware, { tokenBlacklist } from "./auth.middleware";
import jwt from "jsonwebtoken";
import { decrypt, decryptEnvValues, encrypt, encryptEnvValues } from "./crypto";
import { log } from "./logger";
import { v4 as uuidv4 } from "uuid";

// Define your User type
interface User {
  id: string;
  email: string;
  group: string;
  name: string;
  // Add other user properties as needed
}

declare global {
  namespace Express {
    interface Request {
      user?: User; // Make user optional if it might not always be present
    }
  }
}

export function createLdapClient(AD_CONFIG: LdapConfig) {
  const client = ldap.createClient({
    // url: 'ldaps://localhost:636',
    url: AD_CONFIG.url,
    tlsOptions: {
      rejectUnauthorized: false,
    },
  });

  client.on("error", (err) => {
    log("LDAP client connection error:", err.message);
  });

  return client;
}

export async function registerRoutes(app: Express): Promise<any> {
  // app.use("/api",authMiddleware);

  // Dashboard summary endpoints
  app.use(
    "/api/dashboard",
    authMiddleware,
    checkRole("hrleader"),
    dashboardRoutes
  );

  // Notification endpoints
  app.use(
    "/api/notifications",
    authMiddleware,
    checkRole("hrleader:functionalleader"),
    notificationRoutes
  );

  // User management endpoints
  app.use(
    "/api/users",
    authMiddleware,
    checkRole("hrleader:functionalleader"),
    usersRoutes
  );

  app.post("/api/ed", authMiddleware, checkRole("admin"), (req, res) => {
    try {
      const { value, method, key } = req.body;
      if (method === "encrypt") {
        const encrypted =
          typeof value === "object"
            ? encryptEnvValues(value)
            : encrypt(value, key?.trim());
        return res.json({ data: encrypted });
      }
      if (method === "decrypt") {
        const decrypted =
          typeof value === "object"
            ? decryptEnvValues(value)
            : decrypt(value, key?.trim());
        return res.json({ data: decrypted });
      }
      res.json({ error: "method not found" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to ed", error: error?.message });
    }
  });

  app.get("/api/verify-token", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      res.json({ success: true, user: convertKeysToCamelCase(decoded?.user) });
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  app.post("/api/ad/login", async (req, res) => {
    try {
      const { username, password, domain = "@acme-health.com" } = req.body;
      const adConfig = await getAdConfig();
      const client = createLdapClient(adConfig);
      const userPrincipal = `${username}${domain}`;

      client.bind(userPrincipal, password, async (err) => {
        if (err) {
          client.unbind();
          return res.status(401).json({
            success: false,
            message: "LDAP authentication failed",
            error: err.message,
          });
        }

        const { user, token, error } = await handleLdapUserAuthentication(
          username
        );
        client.unbind();

        if (error) {
          return res
            .status(404)
            .json({ success: false, message: error, user: username });
        }

        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 * 1000,
        });

        res.json({ success: true, token, user: convertKeysToCamelCase(user) });
      });
    } catch (error: any) {
      log("error ==> ", error);
      res
        .status(500)
        .json({ message: "Failed to log in user", error: error.message });
    }
  });

  // app.get("/api/auth/ad", (req: any, res) => {
  //   try {
  //     const sso = new sspi({
  //       offerSSPI: true,
  //       authoritative: true,
  //       perRequestAuth: true,
  //     });

  //     sso.authenticate(req, res, async (err?: Error) => {
  //       if (res.headersSent) return;

  //       if (err) {
  //         log("SSO Authentication Error:", err);
  //         return res
  //           .status(500)
  //           .json({ success: false, message: "Internal SSO error." });
  //       }

  //       const windowsUser = req.connection.user;

  //       if (!windowsUser) {
  //         return res.status(401).json({
  //           success: false,
  //           user: null,
  //           message: "Not an authenticated Windows user.",
  //         });
  //       }

  //       try {
  //         const username = windowsUser.split("\\").pop();
  //         const { user, token, error } = await handleLdapUserAuthentication(
  //           username
  //         );

  //         if (error) {
  //           return res
  //             .status(404)
  //             .json({ success: false, message: error, user: username });
  //         }

  //         res.cookie("token", token, {
  //           maxAge: 60 * 60 * 1000,
  //           httpOnly: true,
  //           secure: true,
  //         });

  //         return res.status(200).json({ success: true, user });
  //       } catch (dbError) {
  //         log("error during SSO:", dbError);
  //         res.status(500).json({
  //           success: false,
  //           user: null,
  //           message: "Database error during authentication.",
  //         });
  //       }
  //     });
  //   } catch (error: any) {
  //     log("Failed to login: ", error?.message);
  //     res.status(500).json({ error: "Failed to login with sspi" });
  //   }
  // });

  app.post(
    "/api/search",
    authMiddleware,
    checkRole("admin"),
    async (req, res) => {
      try {
        const { searchId } = req.body;
        const config = await getAdConfig();
        const client = createLdapClient(config);
        // const client = createLdapClient();

        // const adminDN = "cn=Manager,dc=my-domain,dc=com";
        // const adminPass = 'secret';
        // const searchBase = 'dc=my-domain,dc=com';

        const adminDN = config.bindDN;
        const adminPass = config.bindPassword;
        const searchBase = config.baseDN;

        const searchFilter = `(sAMAccountName=${searchId})`;
        // const searchFilter = `(|(cn=*${searchId}*)(mail=*${searchId}*)(uid=*${searchId}*)(sAMAccountName=*${searchId}*))`;

        client.bind(adminDN, adminPass, (err) => {
          log("err ", err);
          if (err)
            return res.status(500).json({ message: "Admin bind failed" });

          const opts: any = {
            filter: searchFilter,
            scope: "sub",
            // attributes: ['cn', 'givenName', 'sAMAccountName', 'mail']
          };

          const entries: any = [];

          client.search(searchBase, opts, (err, searchRes) => {
            if (err) return res.status(500).json({ message: "Search error" });

            searchRes.on("searchEntry", (entry) => {
              // const flatAttributes: Record<string, string | string[]> = {};

              // (entry.attributes || []).forEach(attr => {
              //   // If multiple values, keep as array; else send as string
              //   flatAttributes[attr.type] = attr.values.length === 1 ? attr.values[0] : attr.values;
              // });

              //   entries.push(flatAttributes);

              const raw = entry.attributes || [];
              const getAttr = (key: any) => {
                const attr = raw.find((a) => a.type === key);
                return attr && attr.values
                  ? (attr.values as any).join(", ")
                  : "";
              };

              const user = {
                cn: getAttr("cn"),
                givenName: getAttr("givenName"),
                sAMAccountName: getAttr("sAMAccountName"),
                mail: getAttr("mail"),
              };

              entries.push(user);
            });

            searchRes.on("end", () => {
              client.unbind();
              res.json({ success: true, results: entries });
            });
          });
        });
      } catch (error: any) {
        res
          .status(500)
          .json({ message: "Failed to search users", error: error?.message });
      }
    }
  );

  app.delete(
    "/api/job/essentialfunction/:id",
    authMiddleware,
    async (req, res) => {
      try {
        log("Deleting essential function with ID:", req.params.id);
        const pool = await getPool();
        const result = await pool
          .request()
          .input("id", sql.Numeric, req.params.id)
          .query(`DELETE FROM dbo.[essential_functions] WHERE id = @id`);
        log("result ==> ", result);
        if (result.rowsAffected[0] === 0) {
          return res
            .status(404)
            .json({ message: "Essential function not found" });
        }
        res.json({ message: "Essential function deleted successfully" });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to delete essential function" });
      }
    }
  );

  app.get(
    "/api/job/finalreview",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req, res) => {
      try {
        const pool = await getPool();
        const result = await pool
          .request()
          .input("JobCode", sql.Int, req.query.jobCode)
          .execute("dbo.[sp_GetJobFinalReview]");
        if (!result) {
          return res.status(404).json({ message: "Job not found" });
        }

        if (Array.isArray(result.recordsets)) {
          const essentialFunctions = result.recordsets[0].map(
            (row: any) => row.EssentialFunctions
          );

          const reviewers = result.recordsets[1].map(
            (row: any) => row.Reviewers
          );

          const jobRow = result.recordsets[2][0];

          const jobDetails = {
            id: jobRow.Id,
            jobCode: jobRow.Job_Code,
            jobTitle: jobRow.Job_Title,
            jobFamily: jobRow.Job_Family,
            status: jobRow.STATUS,
            lastEditedBy: jobRow.LastEditedBy,
            lastUpdated: jobRow.Last_Updated,
            jobSummary: jobRow.JobSummary,
          };

          // The remaining JD elements, read here rather than in
          // sp_GetJobFinalReview so no procedure redeploy is needed. Same
          // precedence as the summary and duties: reviewer edits, else the
          // updated text, else the original.
          const jdResult = await pool
            .request()
            .input("job_id", sql.Int, jobRow.Id).query(`
            SELECT
              jd.other_job_description,
              jd.other_job_description_ai,
              (
                SELECT jsc.section_key, jsc.item_text, jsc.sort_order
                FROM jd_section_changes jsc WITH (NOLOCK)
                WHERE jsc.job_id = @job_id
                ORDER BY jsc.section_key, jsc.sort_order
                FOR JSON PATH
              ) AS jd_section_changes
            FROM job_descriptions jd WITH (NOLOCK)
            WHERE jd.job_id = @job_id
          `);
          const jdRow = jdResult.recordset[0];
          const jobDescriptionSections = effectiveJobDescriptionSections(
            parseJobDescriptionSections(
              jdRow?.other_job_description_ai || jdRow?.other_job_description
            ),
            groupSectionChanges(JSON.parse(jdRow?.jd_section_changes || "[]"))
          );

          const finalReview: JobFinalReview = {
            essentialFunctions,
            reviewers,
            jobDetails,
            jobDescriptionSections,
          };

          res.json(finalReview);
        } else {
          res.status(500).json({
            message: "Failed to fetch Job details for " + req.query.jobCode,
          });
        }
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch Job details for " + req.query.jobCode,
        });
      }
    }
  );

  // Get Jobs List
  app.get(
    "/api/jobs",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req, res) => {
      const {
        search_term = null,
        job_family_id = null,
        status = null,
        reviewer_id = null,
        page = 1,
        limit = 10,
        sortField = "job_title", // NEW
        sortOrder = "ASC", // NEW
      } = req.query;

      try {
        const pool = await getPool();

        const result = await pool
          .request()
          .input("search_term", sql.NVarChar(255), search_term)
          .input(
            "job_family_id",
            sql.Int,
            job_family_id ? parseInt(job_family_id as string) : null
          )
          .input("status", sql.NVarChar(50), status)
          .input(
            "reviewer_id",
            sql.VarChar,
            reviewer_id ? parseInt(reviewer_id as string) : null
          )
          .input("page", sql.Int, parseInt(page as string))
          .input("limit", sql.Int, parseInt(limit as string))
          .input("sortField", sql.NVarChar(50), sortField) // NEW
          .input("sortOrder", sql.NVarChar(4), sortOrder) // NEW
          .execute("sp_SearchJobs");

        const items = result.recordset;
        const total = result.output?.total || (items[0]?.total_count ?? 0);
        res.json({ items, total });
      } catch (err) {
        log("Error fetching jobs:", err);
        res.status(500).json({ error: "Failed to fetch jobs" });
      }
    }
  );

  // Export jobs to excel sheet

  app.get(
    "/api/export-jobs",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req, res) => {
      try {
        const pool = await getPool();
        const result = await pool.request().query(`
      SELECT 
        job_code, 
        jobs.job_title, 
        job_families.job_family as job_family,
        status, 
        FORMAT(last_updated, 'MM-dd-yyyy') AS last_updated,
        (
          SELECT jr.reviewer as name, jr.reviewer as id
          FROM job_reviewers jr WITH (NOLOCK)
          WHERE jr.job_id = jobs.id
          FOR JSON PATH
        ) AS reviewer_names,
        (
          SELECT c.comment, c.category, c.author, c.section_key, FORMAT(c.created_at, 'MM-dd-yyyy HH:mm') AS createdAt, c.is_critical
          FROM comments c WITH (NOLOCK)
          WHERE c.job_id = jobs.id
          ORDER BY c.created_at DESC
          FOR JSON PATH 
        ) AS comments
      FROM jobs
      LEFT JOIN job_families ON jobs.job_family_id = job_families.id
      WHERE jobs.is_active = 1
    `);

        const jobs = result.recordset;
        const formattedJobs = jobs.map((job) => ({
          "Job Code": job.job_code,
          "Job Title": job.job_title,
          Status: job.status,
          "Job Family": job.job_family,
          "Functional Leader": job.reviewer_names
            ? JSON.parse(job.reviewer_names)
                ?.map((c: { name: string }) => c.name)
                ?.join(", ")
            : "",
          "Comments": job.comments
            ? JSON.parse(job.comments)
                ?.map((c: { comment: string; category: string; author: string; section_key: string; createdAt: string; is_critical: boolean }) => 
                  `Section: ${jdSectionLabel(c.section_key) || "N/A"} | Category: ${c.category || "N/A"} | Author: ${c.author || "N/A"} | Created At: ${c.createdAt} | Critical: ${c.is_critical ? "Yes" : "No"}\nComment: ${c.comment || "N/A"}`
                )
                ?.join("\n\n")
            : "",

          "Last Updated": job.last_updated,
        }));

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(formattedJobs);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");

        // Create buffer
        const excelBuffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        // Set headers
        res.setHeader("Content-Disposition", "attachment; filename=jobs.xlsx");
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Expires", "-1");
        res.setHeader("Pragma", "no-cache");

        // Send file
        res.send(excelBuffer);
      } catch (err) {
        log(err);
        res.status(500).json({ message: "Server Error" });
      }
    }
  );

  // Get all Job Families (For Dropdown)
  app.get(
    "/api/all-job-families",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req, res) => {
      try {
        const pool = await getPool();
        const result = await pool.request().execute("sp_GetAllJobFamilies");
        res.json(result.recordset);
      } catch (err) {
        log("Error fetching job families:", err);
        res.status(500).json({ error: "Failed to fetch job families" });
      }
    }
  );

  // GET: Fetch global notification settings
  app.get(
    "/api/notification-settings",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req, res) => {
      try {
        const pool = await getPool();
        const result = await pool
          .request()
          .execute("sp_GetNotificationSettings");
        if (result.recordset.length === 0) {
          return res.status(404).json({ message: "Settings not found" });
        }
        const row = result.recordset[0];
        res.json({
          emailNotifications: !!row.email_notifications,
          jobUpdates: !!row.job_updates,
        });
      } catch (err) {
        log(err);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  // PUT: Update global notification settings
  app.put(
    "/api/notification-settings",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req, res) => {
      const { emailNotifications, jobUpdates } = req.body;
      try {
        const pool = await getPool();
        await pool
          .request()
          .input("email_notifications", sql.Bit, emailNotifications ? 1 : 0)
          .input("job_updates", sql.Bit, jobUpdates ? 1 : 0)
          .execute("sp_UpdateNotificationSettings");
        res.json({ success: true });
      } catch (err) {
        log(err);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  app.get(
    "/api/user-list",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req, res) => {
      try {
        const pool = await getPool();
        const result = await pool.request().query(`
          SELECT DISTINCT reviewer as id
          FROM job_reviewers
          ORDER BY reviewer ASC
        `);

        const result2 = result.recordset.map((c) => ({ ...c, name: c.id }));

        if (!result2) {
          return res.status(404).json({ message: "Job description not found" });
        }

        res.json(result2);
      } catch (error) {
        log("Error fetching job description:", error);
        res.status(500).json({ message: "Failed to fetch job description" });
      }
    }
  );

  app.get(
    "/api/job-description/:jobCode",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req, res) => {
      try {
        const pool = await getPool();

        const result = await pool
          .request()

          .input("job_code", sql.NVarChar(50), req.params.jobCode).query(`

        SELECT 
          jobs.id,
          jobs.job_code,
          jobs.job_title,
          jobs.status,
          FORMAT(job_descriptions.last_updated_date, 'MMMM dd, yyyy') AS last_updated,
          job_descriptions.job_summary_original,
          job_descriptions.job_summary_ai,
          job_descriptions.job_summary_changes,
          job_descriptions.other_job_description,
          job_descriptions.other_job_description_ai,
          job_descriptions.is_active,
--          job_descriptions.is_critical,
          job_descriptions.last_edited_by,
          job_families.job_family,

          -- Reviewers
          (
            SELECT jr.reviewer as name, jr.reviewer as id
            FROM job_reviewers jr WITH (NOLOCK)
            WHERE jr.job_id = jobs.id
            FOR JSON PATH
          ) AS reviewers,

          -- Essential Functions Original
          (
            SELECT ef.function_text, ef.sort_order, ef.id
            FROM essential_functions_original ef WITH (NOLOCK)
            WHERE ef.job_id = jobs.id
            ORDER BY ef.sort_order
            FOR JSON PATH
          ) AS essential_functions_original,

          -- Essential Functions AI
          (
            SELECT oef.function_text, oef.sort_order
            FROM essential_functions_ai oef WITH (NOLOCK)
            WHERE oef.job_id = jobs.id
            ORDER BY oef.sort_order, oef.id
            FOR JSON PATH
          ) AS essential_functions_ai,

          -- Comments
          (
            SELECT c.id, c.comment, c.category, c.author, c.section_key, FORMAT(c.created_at, 'MM-dd-yyyy HH:mm') AS createdAt, c.is_critical
            FROM comments c WITH (NOLOCK)
            WHERE c.job_id = jobs.id
            ORDER BY c.created_at DESC
            FOR JSON PATH 
          ) AS comments,

          -- Essential Functions Changes
          (
            SELECT oef.function_text, oef.sort_order, oef.id
            FROM essential_functions_changes oef WITH (NOLOCK)
            WHERE oef.job_id = jobs.id
            ORDER BY oef.sort_order, oef.id
            FOR JSON PATH
          ) AS essential_functions_changes,

          -- Reviewer edits to the editable JD elements
          (
            SELECT jsc.section_key, jsc.item_text, jsc.sort_order
            FROM jd_section_changes jsc WITH (NOLOCK)
            WHERE jsc.job_id = jobs.id
            ORDER BY jsc.section_key, jsc.sort_order
            FOR JSON PATH
          ) AS jd_section_changes
        FROM jobs WITH (NOLOCK)
        LEFT JOIN job_descriptions WITH (NOLOCK) ON jobs.id = job_descriptions.job_id 
        LEFT JOIN job_families WITH (NOLOCK) ON jobs.job_family_id = job_families.id
        LEFT JOIN comments WITH (NOLOCK) ON jobs.id = comments.job_id
        WHERE jobs.job_code = @job_code
      `);
        const job = result.recordset[0];
        if (!result || !job) {
          return res.status(404).json({ message: "Job description not found" });
        }
        job.responsibles = JSON.parse(job?.responsibles || "[]");
        job.reviewers = JSON.parse(job?.reviewers || "[]");
        job.essential_functions_original = JSON.parse(
          job?.essential_functions_original || "[]"
        );
        job.essential_functions_ai = JSON.parse(
          job?.essential_functions_ai || "[]"
        );
        job.essential_functions_changes = JSON.parse(
          job?.essential_functions_changes || "[]"
        );
        // Every comment belongs to a JD element. An unknown or missing
        // section_key falls back rather than going unrendered: the editing page
        // sends back every comment it loaded, and the save below deletes the
        // caller's comments that are missing from that payload.
        job.comments = JSON.parse(job?.comments || "[]").map((c: any) => ({
          ...c,
          section_key: commentSectionKey(c.section_key),
          isEditable: c.author === req.user?.name || !c.author,
        }));
        // Split the free-text `other_job_description` blobs into the named
        // Acme Health JD elements the editing page renders. The plain blob holds
        // the legacy job description, `_ai` the updated one; the editing page
        // shows one on each panel and falls back to the original when a job
        // has no updated blob.
        job.job_description_sections = parseJobDescriptionSections(
          job?.other_job_description
        );
        job.job_description_sections_ai = parseJobDescriptionSections(
          job?.other_job_description_ai || job?.other_job_description
        );
        // Reviewer edits to the editable elements, grouped by element. A key
        // is present once that element has been saved, even when it was saved
        // empty, so deleted items do not reappear on the next load.
        job.job_description_section_changes = groupSectionChanges(
          JSON.parse(job?.jd_section_changes || "[]")
        );
        delete job.jd_section_changes;
        res.json(convertKeysToCamelCase(job));
      } catch (error) {
        log("Error fetching job description:", error);
        res.status(500).json({ message: "Failed to fetch job description" });
      }
    }
  );

  app.put(
    "/api/job-description",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req, res) => {
      try {
        const {
          // responsibles = [],
          reviewers = [],
          jobId,
          essentialFunctionsChanges = [],
          jdSectionChanges = null,
          jobSummaryChanges = "",
          // isCritical,
          comments,
          updateStatus,
        } = req.body;
        const reviewer = req.user?.name;
        if (!reviewer) {
          return res.status(400).json({ message: "Reviewer is required" });
        }
        const pool = await getPool();

        const allReviewers = await pool.query(
          "SELECT DISTINCT reviewer FROM job_reviewers"
        );
        const allReviewersSet = new Set(
          allReviewers.recordset.map((c) => c.reviewer)
        );
        const areReviewersValid = reviewers.every((reviewer: string) =>
          allReviewersSet.has(reviewer)
        );
        if (!areReviewersValid) {
          return res
            .status(400)
            .json({ message: "Please provide valid reviewers!" });
        }

        
        const transaction = new sql.Transaction(pool);
        try {
          await transaction.begin();
          
          // --- Step 1: Fetch existing comments from DB ---
          const dbComments = await fetchDbComments(transaction, jobId);
          const dbMap = new Map(dbComments.map(c => [c.id, c.author]));

          const payloadIds = comments.map((c: any) => c.id).filter(Boolean);

          // --- Step 2: Delete missing user comments ---
          await deleteMissingUserComments(transaction, jobId, reviewer, payloadIds);

          // --- Step 3: Upsert comments from payload ---
          // Each comment is stored against the JD element it was written under;
          // commentSectionKey() coerces anything the UI cannot render.
          for (const c of comments) {
            if (isExistingComment(c, dbMap)) {
              await updateIfAuthorMatches(transaction, c, reviewer);
            } else {
              await insertComment(transaction, c, jobId, reviewer);
            }
          }


            
          let query = `UPDATE jobs SET reviewer = @userId`;
          if (updateStatus) {
            query += `, status = 'In Progress'`;
          }
          query += ` WHERE id = @jobId`;
          await new sql.Request(transaction)
            .input("userId", sql.VarChar, reviewer)
            .input("jobId", sql.Int, jobId)
            .query(query);
          await new sql.Request(transaction)
            .input("jobSummaryChanges", sql.VarChar(sql.MAX), jobSummaryChanges)
            // .input("isCritical", sql.Bit, isCritical)
            // .input("comments", sql.VarChar(sql.MAX), comments)
            .input("jobId", sql.Int, jobId)
            .input("reviewer", sql.VarChar, reviewer)
            .query(
              `UPDATE job_descriptions SET job_summary_changes = @jobSummaryChanges, last_updated_date = GETDATE(), last_edited_by = @reviewer WHERE id = @jobId`
            );
          await updateEssentialFunctions(
            jobId,
            essentialFunctionsChanges,
            transaction
          );
          await updateJdSectionChanges(jobId, jdSectionChanges, transaction);
          await replaceResponsiblesAndReviewers(
            jobId,
            // responsibles,
            reviewers,
            transaction
          );
          await transaction.commit();
          res
            .status(200)
            .json({ message: "Job description updated successfully" });
        } catch (error) {
          log("Error updating job description:", error);
          await transaction
            .rollback()
            .catch((err) => log("Failed to rollback"));
          res.status(500).json({ message: "Failed to update job description" });
        }
      } catch (error) {
        log("Error updating job description:", error);
        res.status(500).json({ message: "Failed to update job description" });
      }
    }
  );


  async function fetchDbComments(transaction: sql.Transaction, jobId: number) {
  const result = await new sql.Request(transaction)
    .input("jobId", sql.Int, jobId)
    .query("SELECT id, author FROM comments WHERE job_id = @jobId");
  return result.recordset;
}

function isExistingComment(comment: any, dbMap: Map<number, string>) {
  return comment.id && dbMap.has(comment.id);
}

async function updateIfAuthorMatches(transaction: sql.Transaction, comment: any, user: string) {
  await new sql.Request(transaction)
    .input("id", sql.Int, comment.id)
    .input("comment", sql.NVarChar, comment.comment)
    .input("category", sql.NVarChar, comment.category)
    .input("author", sql.NVarChar, user)
    .input("sectionKey", sql.NVarChar(64), commentSectionKey(comment.sectionKey))
    .input("isCritical", sql.Bit, comment.isCritical)
    .query(`
      UPDATE comments
      SET comment = @comment, category = @category, author = @author, section_key = @sectionKey, is_critical = @isCritical
      WHERE id = @id
        AND (author = @author OR author IS NULL)
    `);
}

async function insertComment(transaction: sql.Transaction, comment: any, jobId: number, user: string) {
  const result = await new sql.Request(transaction)
    .input("jobId", sql.Int, jobId)
    .input("comment", sql.NVarChar, comment.comment)
    .input("category", sql.NVarChar, comment.category)
    .input("author", sql.NVarChar, user)
    .input("sectionKey", sql.NVarChar(64), commentSectionKey(comment.sectionKey))
    .input("isCritical", sql.Bit, comment.isCritical)
    .query(`
      INSERT INTO comments (job_id, comment, category, author, section_key, is_critical)
      VALUES (@jobId, @comment, @category, @author, @sectionKey, @isCritical)
    `);

}

async function deleteMissingUserComments(
  transaction: sql.Transaction,
  jobId: number,
  user: string,
  payloadIds: number[]
) {
  if (payloadIds.length > 0) {
    await new sql.Request(transaction)
      .input("jobId", sql.Int, jobId)
      .input("author", sql.NVarChar, user)
      .query(`
        DELETE FROM comments
        WHERE job_id = @jobId
          AND (author = @author OR author IS NULL)
          AND id NOT IN (${payloadIds.join(",")})
      `);
  } else {
    await new sql.Request(transaction)
      .input("jobId", sql.Int, jobId)
      .input("author", sql.NVarChar, user)
      .query(`
        DELETE FROM comments
        WHERE job_id = @jobId
          AND (author = @author OR author IS NULL)
      `);
  }
}


  app.post(
    "/api/job/hr-review",
    authMiddleware,
    checkRole("functionalleader"),
    async (req, res) => {
      try {
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        try {
          const { jobId, jobCode } = req.body;
          const message = `Job ${jobCode} Needs Your Approval`;
          await transaction.begin();
          await new sql.Request(transaction)
            .input("jobId", sql.Int, jobId)
            .query(
              `UPDATE jobs SET status = 'Submitted to HR' WHERE id = @jobId`
            );
          await new sql.Request(transaction)
            .input("message", sql.VarChar, message)
            .input("jobId", sql.Int, jobId)
            .input("username", sql.VarChar, "").query(`
        DELETE FROM notifications WHERE job_id = @jobId;

        INSERT INTO notifications (
          username, job_id, title, message, type, category, priority, is_read, status
        )
        VALUES (
          @username, @jobId, 'Job Submitted for Review', @message,
          'info', 'job_status', 'medium', 0, 'Submitted to HR'
        );
      `);
          await transaction.commit();
          res.status(200).json({ message: "Job submitted for HR review" });
        } catch (error) {
          log("err ==> ", error);
          await transaction
            .rollback()
            .catch((err) => log("Failed to rollback"));
          res.status(500).json({ message: "Failed to submit for HR review" });
        }
      } catch (error) {
        res.status(500).json({ message: "Failed to submit for HR review" });
      }
    }
  );

  app.post(
    "/api/job/accept-changes",
    authMiddleware,
    checkRole("functionalleader"),
    async (req, res) => {
      try {
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        try {
          const { jobId, jobCode, name } = req.body;
          const message = `Job ${jobCode} Accepted As Is`;
          await transaction.begin();
          await new sql.Request(transaction)
            .input("jobId", sql.Int, jobId)
            .query(
              `UPDATE jobs SET status = 'Accepted As Is' WHERE id = @jobId`
            );
          await new sql.Request(transaction)
            .input("message", sql.VarChar, message)
            .input("jobId", sql.Int, jobId)
            .input("username", sql.VarChar, "").query(`
        DELETE FROM notifications WHERE job_id = @jobId;

        INSERT INTO notifications (
          username, job_id, title, message, type, category, priority, is_read, status
        )
        VALUES (
          @username, @jobId, 'Job Accepted As Is', @message,
          'info', 'job_status', 'medium', 0, 'Accepted As Is'
        );
      `);
          await transaction.commit();
          res
            .status(200)
            .json({ message: "Job changes accepted successfully" });
        } catch (error) {
          await transaction
            .rollback()
            .catch((err) => log("Failed to rollback"));
          log("err ==> ", error);
          res.status(500).json({ message: "Failed to accept changes" });
        }
      } catch (error) {
        res.status(500).json({ message: "Failed to accept changes" });
      }
    }
  );

  app.put(
    "/api/job/status",
    authMiddleware,
    checkRole("hrleader"),
    async (req, res) => {
      try {
        const { jobId, jobCode, newStatus } = req.body;
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        const message = `Job ${jobCode} Marked As Complete`;
        try {
          await transaction.begin();
          await new sql.Request(transaction)
            .input("newStatus", sql.VarChar, newStatus)
            .input("jobId", sql.Int, jobId)
            .query(`UPDATE jobs SET status = @newStatus WHERE id = @jobId`);
          await new sql.Request(transaction)
            .input("jobId", sql.Int, jobId)
            .input("message", sql.VarChar, message)
            .input("username", sql.VarChar, "")
            .query(`DELETE FROM notifications WHERE job_id = @jobId AND status != 'Completed';
           INSERT INTO notifications (
          username, job_id, title, message, type, category, priority, is_read, status
        )
        VALUES (
          @username, @jobId, 'Job Complete', @message,
          'info', 'job_status', 'medium', 0, 'Changes Complete'
        );
          
          `);
          await transaction.commit();
          res.status(200).json({ message: "Job status updated successfully" });
        } catch (error) {
          log("err ", error);
          await transaction
            .rollback()
            .catch((err) => log("Failed to rollback"));
          res.status(500).json({ message: "Failed to update job status" });
        }
      } catch (error) {
        res.status(500).json({ message: "Failed to update job status" });
      }
    }
  );

  /**
   * Reset a job's status backwards so an error can be corrected.
   *
   *  - HR Leader (or Admin): 'Submitted to HR' / 'Accepted As Is' -> 'In Progress',
   *    handing the job back to the Functional Leader to view and edit.
   *  - Admin only: 'Completed' -> 'Submitted to HR', handing the job back to the
   *    HR Leader to view, edit and complete again.
   *
   * checkRole("hrleader") is only a coarse gate here -- it short-circuits for
   * 'admin', so it cannot express "admin only". The authoritative check is
   * resetTargetFor(), evaluated against the job's status as read and locked
   * inside the transaction. The client never gets to say what the current status
   * is or what it resets to.
   */
  app.post(
    "/api/job/reset-status",
    authMiddleware,
    checkRole("hrleader"),
    async (req, res) => {
      const jobId = Number(req.body?.jobId);
      const reason = String(req.body?.reason ?? "").trim();
      const actorName = req.user?.name ?? "";

      if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({ message: "A valid jobId is required" });
      }
      if (!reason) {
        return res
          .status(400)
          .json({ message: "A reason for the reset is required" });
      }
      if (reason.length > RESET_REASON_MAX_LENGTH) {
        return res.status(400).json({
          message: `Reason must be ${RESET_REASON_MAX_LENGTH} characters or fewer`,
        });
      }

      const actor = {
        isAdmin: hasRole(req.user, "admin"),
        isHrLeader: hasRole(req.user, "hrleader"),
      };

      try {
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        try {
          await transaction.begin();

          const currentResult = await new sql.Request(transaction)
            .input("jobId", sql.Int, jobId)
            .query(`
              SELECT id, job_code, status
              FROM jobs WITH (UPDLOCK, HOLDLOCK)
              WHERE id = @jobId
            `);
          const job = currentResult.recordset[0];

          if (!job) {
            await transaction.rollback();
            return res.status(404).json({ message: "Job not found" });
          }

          const target = resetTargetFor(job.status, actor);
          if (!target) {
            await transaction.rollback();
            // Tell "you may not do this" apart from "nobody may do this".
            return isResettableStatus(job.status)
              ? res.status(403).json({
                  message:
                    "Only an Administrator can reset a job in this status",
                })
              : res.status(409).json({
                  message: `A job with status '${job.status}' cannot be reset`,
                });
          }

          const isReturnToLeader = target === "In Progress";

          // The status guard closes the race where the job moved on between the
          // read and the write (two resets, or a reset racing a Save Draft).
          const updated = await new sql.Request(transaction)
            .input("jobId", sql.Int, jobId)
            .input("target", sql.NVarChar(50), target)
            .input("expected", sql.NVarChar(50), job.status)
            .input("actor", sql.NVarChar(255), actorName)
            .query(`
              UPDATE jobs
                 SET status = @target,
                     -- jobs.reviewer is the existing last-writer stamp, written
                     -- the same way (req.user.name) by PUT /api/job-description.
                     reviewer = @actor,
                     last_updated = SYSDATETIME()
               WHERE id = @jobId AND status = @expected
            `);

          if (updated.rowsAffected[0] !== 1) {
            await transaction.rollback();
            return res.status(409).json({
              message: "Job status changed while you were resetting it",
            });
          }

          const title = isReturnToLeader
            ? "Job Returned for Edits"
            : "Job Reopened for HR Review";
          const message = isReturnToLeader
            ? `Job ${job.job_code} was returned for edits by ${actorName}: ${reason}`
            : `Job ${job.job_code} was reopened for HR review by ${actorName}: ${reason}`;
          // The notification status drives visibility, not just the label:
          // sp_GetUserNotifications hides rows with status 'Submitted to HR'
          // from anyone who is not an HR leader. A job returned to the
          // Functional Leader must therefore NOT use that label, or the person
          // who needs to act on it would never see it. The admin reset does use
          // it, because the job really is back in HR's court.
          const notificationStatus = isReturnToLeader
            ? "Returned for Edits"
            : "Submitted to HR";

          await new sql.Request(transaction)
            .input("jobId", sql.Int, jobId)
            .input("username", sql.NVarChar(255), "")
            .input("title", sql.NVarChar(255), title)
            .input("message", sql.NVarChar(sql.MAX), message)
            .input("notificationStatus", sql.NVarChar(50), notificationStatus)
            .query(`
              DELETE FROM notifications WHERE job_id = @jobId;

              INSERT INTO notifications (
                username, job_id, title, message, type, category, priority, is_read, status
              )
              VALUES (
                @username, @jobId, @title, @message,
                'warning', 'job_status', 'high', 0, @notificationStatus
              );
            `);

          await transaction.commit();
          res.status(200).json({
            message: `Job reset to ${target}`,
            previousStatus: job.status,
            status: target,
          });
        } catch (error) {
          log("err ==> ", error);
          await transaction
            .rollback()
            .catch(() => log("Failed to rollback"));
          res.status(500).json({ message: "Failed to reset job status" });
        }
      } catch (error) {
        res.status(500).json({ message: "Failed to reset job status" });
      }
    }
  );

  app.get(
    "/api/export-notifications",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req: Request, res: Response) => {
      try {
        const pool = await getPool();
        const user = req?.user;
        const isHRLeader = user?.group?.split(":")?.includes("hrleader");
        const result = await pool
          .request()
          .input("isHrLeader", sql.Bit, isHRLeader).query(`
        SELECT *
        FROM (
          SELECT 
            n.title,
            n.message,
            n.status,
            n.updated_at,
            jf.job_family,
            CASE 
              WHEN n.status = 'Submitted to HR' THEN 0 
              ELSE 1 
            END AS ShowNotification
          FROM notifications n 
          JOIN jobs j ON j.id = n.job_id
          LEFT JOIN job_families jf ON jf.id = j.job_family_id 
          WHERE j.is_active = 1
        ) T
        WHERE (
          @isHrLeader = 1
          OR (ShowNotification = 1 AND status != 'Submitted to HR')
        )
    `);

        const notifications = result.recordset;
        const formattedNotifications = notifications.map((notification) => ({
          Title: notification.title,
          Message: notification.message,
          "Job Family": notification.job_family,
          Status: notification.status,
          "Last Updated": notification.updated_at,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedNotifications);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");

        const excelBuffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        res.setHeader(
          "Content-Disposition",
          "attachment; filename=notifications.xlsx"
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Expires", "-1");
        res.setHeader("Pragma", "no-cache");

        res.send(excelBuffer);
      } catch (err) {
        log(err);
        res.status(500).json({ message: "Server Error" });
      }
    }
  );

  app.post(
    "/api/config",
    authMiddleware,
    checkRole("admin"),
    async (req, res) => {
      try {
        const configString = JSON.stringify(req.body.config);
        const encryptedConfig = encrypt(configString);

        const pool = await getPool();
        const result = await pool
          .request()
          .input("title", sql.VarChar, req.body.title)
          .input("json_text", sql.VarChar, encryptedConfig).query(`
            INSERT INTO configuration (title, json_text)
            VALUES (@title, @json_text)
          `);
        // if (result.rowsAffected[0] === 0) {
        //   return res.status(404).json({ message: "Config not found" });
        // }
        res.json({ message: "Config created successfully" });
      } catch (error) {
        log("Error creating config:", error);
        res.status(500).json({ message: "Failed to create config" });
      }
    }
  );

  app.put(
    "/api/config/:id",
    authMiddleware,
    checkRole("admin"),
    async (req, res) => {
      try {
        const id = req.params.id as string;
        const configString = JSON.stringify(req.body.config);
        const encryptedConfig = encrypt(configString);
        const pool = await getPool();
        const result = await pool
          .request()
          .input("json_text", sql.VarChar, encryptedConfig)
          .input("id", sql.Int, Number(id)).query(`
        UPDATE configuration
        SET json_text = @json_text
        WHERE id = @id
      `);
        if (result.rowsAffected[0] === 0) {
          return res.status(404).json({ message: "Config not found" });
        }
        res.json({ message: "Config updated successfully" });
      } catch (error) {
        log("Error updating config:", error);
        res.status(500).json({ message: "Failed to update config" });
      }
    }
  );

  app.delete(
    "/api/config/:id",
    authMiddleware,
    checkRole("admin"),
    async (req, res) => {
      try {
        const id = req.params.id as string;
        const pool = await getPool();
        const result = await pool.request().input("id", sql.Int, Number(id))
          .query(`
        DELETE FROM configuration
        WHERE id = @id
      `);
        if (result.rowsAffected[0] === 0) {
          return res.status(404).json({ message: "Config not found" });
        }
        res.json({ message: "Config deleted successfully" });
      } catch (error) {
        log("Error deleting config:", error);
        res.status(500).json({ message: "Failed to delete config" });
      }
    }
  );

  app.get(
    "/api/config/:title",
    authMiddleware,
    checkRole("admin"),
    async (req, res) => {
      try {
        const title = req.params.title as string;
        const pool = await getPool();
        const result = await pool.request().input("title", sql.VarChar, title)
          .query(`
        SELECT * FROM configuration
        WHERE title = @title
      `);
        const formatedData = result.recordset.map((row) => {
          const decryptedConfig = row.json_text.startsWith("{")
            ? row.json_text
            : decrypt(row.json_text);
          return {
            ...JSON.parse(decryptedConfig),
            id: row.id,
            isActive: row.is_active,
          };
        });
        res.json(formatedData);
      } catch (error) {
        log("Error fetching config:", error);
        res.status(500).json({ message: "Failed to fetch config" });
      }
    }
  );

  app.put(
    "/api/config/activate/:id",
    authMiddleware,
    checkRole("admin"),
    async (req, res) => {
      try {
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        try {
          await transaction.begin();
          await new sql.Request(transaction).query(
            `UPDATE configuration SET is_active = 0 WHERE title = 'active-directory' AND is_active = 1`
          );

          const result = await new sql.Request(transaction)
            .input("id", sql.Int, req.params.id)
            .input("isActive", sql.Bit, true).query(`
          UPDATE configuration
          SET is_active = @isActive
          WHERE id = @id
        `);

          await transaction.commit();
          if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Config not found" });
          }

          res.json({ message: "Config activated successfully" });
        } catch (error) {
          log("Error activating config:", error);
          await transaction.rollback();
          res.status(500).json({ message: "Failed to activate config" });
        }
      } catch (error) {
        log("err ==> ", error);
        res.status(500).json({ message: "Failed to activate config" });
      }
    }
  );

  // GET all unread notifications
  app.get(
    "/api/all_notifications",
    authMiddleware,
    checkRole("functionalleader:hrleader"),
    async (req: Request, res: Response) => {
      try {
        const { search, role, status, sortBy, sortOrder } = req.query;
        // const isHRLeader = req.query.isHRLeader === "true" ? true : false;
        const isHRLeader = req?.user?.group?.split(":")?.includes("hrleader");
        const pool = await getPool();
        const result = await pool
          .request()
          .input("isHRLeader", sql.Bit, isHRLeader)
          .execute("sp_GetAllNotifications");

        res.json(convertKeysToCamelCaseWithISO(result.recordset));
      } catch (err) {
        log("Error fetching notifications:", err);
        res.status(500).json({ error: "Failed to fetch notifications" });
      }
    }
  );

  //logout route
  app.get("/api/logout", authMiddleware, async (req, res) => {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.decode(token) as { exp: number };
      if (decoded?.exp) {
        tokenBlacklist.set(token, decoded.exp * 1000); // store expiration in ms
      }
    }
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
    // res.redirect('/');
  });

  app.get(
    "/api/export-jobs-completed",
    authMiddleware,
    checkRole("hrleader:functionalleader"),
    async (req, res) => {
      try {
        const pool = await getPool();
        const result = await pool.request().execute("dbo.sp_GetCompletedJobs");
        const jobs = result.recordset;
        // Format data
        const formattedJobs = jobs.map((job) => ({
          "Job Code": job.Job_Code,
          "Job Title": job.Job_Title,
          "Job Family": job.Job_Family,
          Status: job.Status,
          "Job Summary": job.JobSummary,
          "Other Job Description": job.OtherJobDescription,
          "Essential Functions": job.EssentialFunctions?.replace(/\\n/g, "\n"), // Convert "\\n" to actual newline
          "Functional Leader": job.Reviewers.replace(/\\n/g, "\n"),
          "Comments": job.Comments
            ? JSON.parse(job.Comments)
                ?.map((c: { Comment: string; Category: string; Author: string; SectionKey: string; CreatedAt: string; IsCritical: boolean }) => 
                  `Section: ${jdSectionLabel(c.SectionKey) || "N/A"} | Category: ${c.Category || "N/A"} | Author: ${c.Author || "N/A"} | Created At: ${c.CreatedAt} | Critical: ${c.IsCritical ? "Yes" : "No"}\nComment: ${c.Comment || "N/A"}`
                )
                ?.join("\n\n")
            : "",

          "Last Updated": job.Last_Updated,
          "Last Edited By": job.LastEditedBy,
        }));

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(formattedJobs);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs-Completed");

        // Optional: set column widths to help Excel display new lines more clearly
        worksheet["!cols"] = [
          { wch: 15 }, // Job Code
          { wch: 25 }, // Job Title
          { wch: 20 }, // Job Family
          { wch: 25 }, // Other Job Description
          { wch: 15 }, // Status
          { wch: 40 }, // Job Summary
          { wch: 60 }, // Essential Functions - wider column to fit multiline text
          { wch: 25 }, // Functional Leader
          { wch: 20 }, // Last Updated
          { wch: 20 }, // Last Edited By
        ];

        // Write file to buffer
        const excelBuffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        // Set headers
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=jobs-completed.xlsx"
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Expires", "-1");
        res.setHeader("Pragma", "no-cache");

        // Send file
        res.send(excelBuffer);
      } catch (err) {
        log(err);
        res.status(500).json({ message: "Server Error" });
      }
    }
  );

  app.post("/api/user/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      if (email !== "admin" || password !== "admin") {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const user = {
        id: "john",
        name: "John Doe",
        group: role,
      };

      const token = generateToken(user);
      res.cookie("token", token, {
        maxAge: 60 * 60 * 1000, // 1 hour
        httpOnly: true,
      });

      res.json({ success: true, user: convertKeysToCamelCase(user) });
    } catch (error) {
      res.status(500).json({ message: "Failed to log in user" });
    }
  });

  // return httpServer;
}

async function updateEssentialFunctions(
  jobId: number,
  essentialFunctions: any,
  transaction: sql.Transaction
) {
  // for (const func of essentialFunctions) {
  // }
  await new sql.Request(transaction)
    .input("jobId", sql.Int, jobId)
    .query(`DELETE FROM essential_functions_changes WHERE job_id = @jobId`);

  for (const func of essentialFunctions) {
    await // .input("jobDescriptionId", sql.Int, 0)
    // .input("hasEdit", sql.Bit, func.hasEdit || true)
    new sql.Request(transaction)
      .input("jobId", sql.Int, jobId)
      .input("functionText", sql.VarChar(sql.MAX), func.text)
      .input("sortOrder", sql.Int, func.sortOrder).query(`
          INSERT INTO essential_functions_changes (job_id, function_text, sort_order)
          VALUES (@jobId, @functionText, @sortOrder)
        `);
  }
}

/**
 * Replaces the reviewer edits for the editable JD elements. Elements absent
 * from the payload are left untouched, so a caller that does not know about
 * these elements cannot wipe them. An element saved with no items keeps a
 * single sort_order = -1 marker row, which is how "emptied" stays
 * distinguishable from "never edited".
 */
async function updateJdSectionChanges(
  jobId: number,
  sectionChanges: Record<string, string[]> | null,
  transaction: sql.Transaction
) {
  if (!sectionChanges) return;

  for (const [sectionKey, items] of Object.entries(sectionChanges)) {
    if (!isEditableSectionKey(sectionKey)) continue;

    await new sql.Request(transaction)
      .input("jobId", sql.Int, jobId)
      .input("sectionKey", sql.NVarChar(64), sectionKey)
      .query(
        `DELETE FROM jd_section_changes WHERE job_id = @jobId AND section_key = @sectionKey`
      );

    const texts = (Array.isArray(items) ? items : [])
      .map((text) => String(text ?? "").trim())
      .filter(Boolean);

    if (!texts.length) {
      await new sql.Request(transaction)
        .input("jobId", sql.Int, jobId)
        .input("sectionKey", sql.NVarChar(64), sectionKey)
        .query(
          `INSERT INTO jd_section_changes (job_id, section_key, item_text, sort_order)
           VALUES (@jobId, @sectionKey, '', -1)`
        );
      continue;
    }

    for (let index = 0; index < texts.length; index++) {
      await new sql.Request(transaction)
        .input("jobId", sql.Int, jobId)
        .input("sectionKey", sql.NVarChar(64), sectionKey)
        .input("itemText", sql.NVarChar(sql.MAX), texts[index])
        .input("sortOrder", sql.Int, index)
        .query(
          `INSERT INTO jd_section_changes (job_id, section_key, item_text, sort_order)
           VALUES (@jobId, @sectionKey, @itemText, @sortOrder)`
        );
    }
  }
}

async function replaceResponsiblesAndReviewers(
  jobId: number,
  // responsibles: number[],
  reviewers: number[],
  transaction: sql.Transaction
) {
  const deleteAndInsert = async (tableName: string, userIds: number[]) => {
    await new sql.Request(transaction)
      .input("jobId", sql.Int, jobId)
      .query(`DELETE FROM ${tableName} WHERE job_id = @jobId`);
    for (const userId of userIds) {
      await new sql.Request(transaction)
        .input("jobId", sql.Int, jobId)
        .input("userId", sql.VarChar, userId).query(`
          INSERT INTO ${tableName} (job_id, reviewer, assigned_at)
          VALUES (@jobId, @userId, GETDATE())
        `);
    }
  };
  await deleteAndInsert("job_reviewers", reviewers);
}

async function getAdConfig() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM configuration
      WHERE title = 'active-directory' AND is_active = 1
    `);
    // log('result ', result)
    if (result?.recordset?.length === 0) {
      throw new Error("Active Directory configuration not found");
    }
    const jsonText = result.recordset[0].json_text;
    const configToParse = jsonText.startsWith("{")
      ? jsonText
      : decrypt(jsonText);
    const config = JSON.parse(configToParse);
    const LDAP_CONFIG = {
      url: `${config.server}:${config.port}`,
      baseDN: config.baseDN,
      bindDN: config.bindDN,
      bindPassword: config.bindPassword,
      searchFilter: config.searchFilter,
      attributes: ["cn", "sn", "uid", "mail", "telephoneNumber"],
    };
    return LDAP_CONFIG;
  } catch (error) {
    log("err ", error);
    throw new Error("Failed to fetch Active Directory configuration");
  }
}

export async function handleLdapUserAuthentication(username: string) {
  const userFromAdData: any = await searchLdapUser(username);
  if (!userFromAdData || userFromAdData.length === 0) {
    return { error: "User not found", user: null };
  }
  const userFromAd = userFromAdData[0];
  const userGroupRole = getUserGroupRole(userFromAd?.memberOf);
  if (!userGroupRole) {
    return { error: "User not found in authorized groups", user: null };
  }
  const userFullName = userFromAd?.givenName + " " + userFromAd?.sn;
  const user = {
    id: objectGUIDToUUID(userFromAd.objectGUID),
    name: userFullName,
    email: userFromAd?.mail,
    group: userGroupRole,
  };
  const token = generateToken(user);
  log("user logged in  => ", {
    name: user.name,
    email: user.email || "n/a",
    group: user.group,
  });
  return { user, token, error: null };
}

interface LdapConfig {
  url: string;
  baseDN: string;
  bindDN: string;
  bindPassword: string;
  searchFilter: string;
  attributes: string[];
}

function searchLdapUser(searchId: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const config = await getAdConfig();
      const client = createLdapClient(config);

      const adminDN = config.bindDN;
      const adminPass = config.bindPassword;
      const searchBase = config.baseDN;
      const searchFilter = `(sAMAccountName=${searchId})`;

      client.bind(adminDN, adminPass, (err) => {
        if (err) return reject(new Error("Admin bind failed"));
        const opts: SearchOptions = {
          filter: searchFilter,
          scope: "sub",
        };
        const entries: any = [];
        client.search(searchBase, opts, (err, searchRes) => {
          if (err) return reject(new Error("Search error"));

          searchRes.on("searchEntry", (entry) => {
            // Convert all attributes to key-value pairs
            const user = {};
            const raw = entry.attributes || [];
            raw.forEach((attr: any) => {
              (user as any)[attr.type] =
                attr.values.length === 1 ? attr.values[0] : attr.values;
            });
            entries.push(user);
          });
          searchRes.on("end", () => {
            client.unbind();
            resolve(entries);
          });
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}

type EnvGroups = {
  GROUP_ADMIN: string;
  GROUP_HRLEADER: string;
  GROUP_FUNCTIONALLEADER: string;
};

function getUserGroupRole(
  memberOf: string[],
  env: EnvGroups = {
    // old env var names kept as fallback for existing deployments
    GROUP_ADMIN: process.env.GROUP_ADMIN || process.env.GROUP_SECURITY || "",
    GROUP_HRLEADER: process.env.GROUP_HRLEADER || "",
    GROUP_FUNCTIONALLEADER:
      process.env.GROUP_FUNCTIONALLEADER || process.env.GROUP_MANAGER || "",
  }
): string | undefined {
  const extractCN = (dn: string) => {
    const match = dn.match(/CN=([^,]+)/);
    return match ? match[1] : null;
  };

  const userGroups = new Set(memberOf.map(extractCN).filter(Boolean));

  const adminGroups = env.GROUP_ADMIN.split(",").map((g) => g.trim());
  const hrLeaderGroups = env.GROUP_HRLEADER.split(",").map((g) => g.trim());
  const functionalLeaderGroups = env.GROUP_FUNCTIONALLEADER.split(",").map((g) => g.trim());

  const roles: string[] = [];

  if (adminGroups.some((group) => userGroups.has(group))) {
    roles.push("admin");
  }

  if (hrLeaderGroups.some((group) => userGroups.has(group))) {
    roles.push("hrleader");
  }

  if (functionalLeaderGroups.some((group) => userGroups.has(group))) {
    roles.push("functionalleader");
  }

  return roles.length ? roles.join(":") : undefined;
}

function generateToken(user: any): string {
  const secret = process.env.JWT_SECRET!;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign(user, secret, { expiresIn: "1h" });
}
