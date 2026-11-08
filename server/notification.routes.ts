import { Request, Response, Router } from "express";
import { getPool } from "./dbSql";
import sql, { IRecordSet } from "mssql";
import { convertKeysToCamelCase } from "./helper";
import { log } from "./logger";

const app = Router();

app.get("/GetNotifications", async (req: Request, res: Response) => {
  try {
    // const userId = req.query.userId ? (req.query.userId as string) : null;
    const jobType = req.query.jobType ? (req.query.jobType as string) : null;
    const pool = await getPool();
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    // const isHRLeader = req.query.isHRLeader === "true" ? true : false;
    const isHRLeader = req.user?.group?.split(':')?.includes('hrleader')
    // Create a new request from the pool
    const request = pool.request();

    // Add input parameters (name, type, value)

    request.input("limit", sql.Int, limit);
    request.input("page", sql.Int, page);

    // request.input("user_id", sql.Int, userId == "-1" ? null : userId);
    request.input("JobType", sql.VarChar, jobType);
    request.input("isHRLeader", sql.Bit, isHRLeader);
    const result = await request.execute("dbo.[sp_GetUserNotifications]");
    const recordsets = result.recordsets;

    if (Array.isArray(recordsets)) {
      // First result set: dynamic rows
      const rows = recordsets[0] as IRecordSet<Record<string, any>>;
      // Second result set: { TotalCount: number }
      const totalCNT = recordsets[1]?.[0] as { TotalCount: number };

      res.json(
        convertKeysToCamelCase(rows, {
          currentPage: 1,
          total: totalCNT.TotalCount,
          totalPages: Math.ceil(totalCNT.TotalCount / 100),
          placeholder: "notifications",
        })
      );
    } else {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  } catch (error) {
    log("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

app.post("/UpdateStatus", async (req, res) => {
  try {
    debugger;
    const { id, status, action } = req.body;
    if (typeof id === "undefined" || typeof action === "undefined") {
      return res.status(400).json({ message: "Notification id and action are required" });
    }

    const pool = await getPool();
    const request = pool.request();
    request.input("notification_id", sql.Int, id);
    // Ensure status is sent as bit (0 or 1)
    request.input("status", sql.Bit, status ? 1 : 0);
    request.input("action", sql.VarChar, action || "update");

    await request.execute("dbo.[sp_UpdateNotificationStatus]");

    res.json({ success: true, message: "Notification status updated successfully" });
  } catch (error) {
    log("Error updating notification status:", error);
    res.status(500).json({ message: "Failed to update notification status" });
  }
});

export default app;