import { Router } from "express";
import { poolPromise } from "./dbSql";
import sql from "mssql";
import { convertKeysToCamelCase } from "./helper";
import "dotenv/config";
import { log } from "./logger";

const app = Router();

app.post("/savepreferences", async (req, res) => {
  try {
    const { pageName, preferences } = req.body;
    const id = req.user?.name
    const pool = await poolPromise;
    const checkResult = await pool.request().input("id", sql.NVarChar, id).input("pageName", sql.NVarChar, pageName).query(`SELECT COUNT(*) as count FROM dbo.[UserSearchPreferences] WHERE username = @id AND PageName = @pageName`);
    let result;
    if (checkResult.recordset[0].count > 0) {
      result = await pool.request().input("id", sql.NVarChar, id).input("pageName", sql.NVarChar, pageName).input("preferences", sql.NVarChar, preferences).query(`UPDATE dbo.[UserSearchPreferences] SET FilterJson = @preferences WHERE username = @id AND PageName = @pageName`);
    } else {
      result = await pool.request().input("id", sql.NVarChar, id).input("pageName", sql.NVarChar, pageName).input("preferences", sql.NVarChar, preferences).query(`INSERT INTO dbo.[UserSearchPreferences] (username, PageName, FilterJson)
           VALUES (@id, @pageName, @preferences)`);
    }
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "User preferences not found" });
    }
    res.json({ message: "User preferences saved successfully" });
  } catch (error) {
    log("err ", error)
    res.status(500).json({ message: "Failed to save user preferences" });
  }
});

app.get("/fetchpreferences/:pageName", async (req, res) => {
  try {
    const userId = req.user?.name
    const pool = await poolPromise;
    const preferences = await pool.request().input("id", sql.NVarChar, userId).input("pageName", sql.NVarChar, req.params.pageName).query(`SELECT * FROM dbo.[UserSearchPreferences] WHERE username = @id AND PageName = @pageName`);
    if (!preferences) {
      return res.status(404).json({ message: "User preferences not found" });
    }
    res.json(convertKeysToCamelCase(preferences.recordset[0]));
  } catch (error) {
    log("err ", error);
    res.status(500).json({ message: "Failed to fetch user preferences" });
  }
});

export default app;
