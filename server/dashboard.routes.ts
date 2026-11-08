import { Router } from "express";
import { getPool } from "./dbSql";
import sql, { IRecordSet } from "mssql";
import { convertKeysToCamelCase } from "./helper";
import { log } from "./logger";

const app = Router();

app.get("/summary", async (req, res) => {
  try {
    const pool = await getPool();
    const summary = await pool
      .request()
      .execute("dbo.[sp_GetDashboardSummary]");
    if (!summary) {
      return res.status(404).json({ message: "Dashboard summary not found" });
    }
    res.json(convertKeysToCamelCase(summary.recordset[0]));
  } catch (error) {
    log("err  ", error);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
});

// Job families endpoint
app.get("/job-families", async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
    const searchTerm = req.query.searchTerm
      ? (req.query.searchTerm as string)
      : null;

    const sortDir = req.query.sortDir ? (req.query.sortDir as string) : null;

    const sortCol = req.query.sortCol ? (req.query.sortCol as string) : null;

    //const result = await storage.getJobFamilies(page, limit);
    //res.json(result);

    const pool = await getPool();
    // Create a new request from the pool
    const request = pool.request();

    // Add input parameters (name, type, value)
    request.input("Page", sql.Int, page);
    request.input("PageSize", sql.Int, limit);
    if (searchTerm) request.input("SearchText", searchTerm);
    if (sortDir) request.input("SortDirection", sortDir);
    if (sortCol) request.input("SortColumn", sortCol);

    // if (sortBy) params.append('sortField', sortBy);
    // if (sortOrder) params.append('sortOrder', sortOrder.toUpperCase());

    const result = await request.execute("dbo.[sp_GetDashboardJobFamilies]");
    const recordsets = result.recordsets;
    if (Array.isArray(recordsets)) {
      // First result set: dynamic rows
      const rows = recordsets[0] as IRecordSet<Record<string, any>>;

      // Second result set: { TotalCount: number }
      const totalCNT = recordsets[1]?.[0] as { TotalCount: number };

      res.json(
        convertKeysToCamelCase(rows, {
          currentPage: page,
          total: totalCNT.TotalCount,
          totalPages: Math.ceil(totalCNT.TotalCount / limit),
          placeholder: "jobFamilies",
        })
      );
    } else {
      res.status(500).json({ message: "Failed to fetch job families" });
    }
  } catch (error) {
    // console.log('err  ', error)
    log("err  ", error)
    res.status(500).json({ message: "Failed to fetch job families" });
  }
});

// Reviewers endpoint
app.get("/reviewers", async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
    const searchTerm = req.query.searchTerm
      ? (req.query.searchTerm as string)
      : null;

    const sortDir = req.query.sortDir ? (req.query.sortDir as string) : null;

    const sortCol = req.query.sortCol ? (req.query.sortCol as string) : null;
    //const result = await storage.getReviewers(page, limit);
    //res.json(result);

    const pool = await getPool();
    // Create a new request from the pool
    const request = pool.request();

    // Add input parameters (name, type, value)
    request.input("Page", sql.Int, page);
    request.input("PageSize", sql.Int, limit);
    if (searchTerm) request.input("SearchText", searchTerm);
    if (sortDir) request.input("SortDirection", sortDir);
    if (sortCol) request.input("SortColumn", sortCol);
    const result = await request.execute("dbo.[sp_GetReviewers]");
    const recordsets = result.recordsets;

    if (Array.isArray(recordsets)) {
      // First result set: dynamic rows
      const rows = recordsets[0] as IRecordSet<Record<string, any>>;
      // Second result set: { TotalCount: number }
      const totalCNT = recordsets[1]?.[0] as { TotalCount: number };

      res.json(
        convertKeysToCamelCase(rows, {
          currentPage: page,
          total: totalCNT.TotalCount,
          totalPages: Math.ceil(totalCNT.TotalCount / limit),
          placeholder: "reviewers",
        })
      );
    } else {
      res.status(500).json({ message: "Failed to fetch job families" });
    }
  } catch (error) {
    // console.log('err in reviewers', error)
    log("err in reviewers", error)
    res.status(500).json({ message: "Failed to fetch reviewers" });
  }
});

export default app;
