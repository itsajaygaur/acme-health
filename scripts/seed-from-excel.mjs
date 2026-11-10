/**
 * Turns the Total Rewards workbook into seed data for the Acme Health database.
 *
 *   node scripts/seed-from-excel.mjs            # write database/03_seed_data.sql
 *   node scripts/seed-from-excel.mjs --apply    # ...and run it against the DB
 *
 * The workbook's "Summary Table" sheet is the only source read: it carries one
 * row per (region, legacy job code) with the full original and updated job
 * description content. The per-job tabs are the same content pivoted, so they
 * add nothing.
 *
 * Shape of the mapping
 * --------------------
 *   Go Forward Code        -> jobs.job_code            (one job per code)
 *   Proposed Job Title     -> jobs.job_title
 *   Final Job Family       -> job_families.job_family
 *   Region / Job Code /
 *     Current Job Title    -> job_code_mappings        (nothing is dropped)
 *   POSITION SUMMARY:      -> job_descriptions.job_summary_original / _ai
 *   ESSENTIAL JOB DUTIES.. -> essential_functions_original / essential_functions_ai
 *   everything else        -> job_descriptions.other_job_description / _ai
 *                             as the bullet blob shared/job-description-fields.ts
 *                             parses back into named elements
 *
 * A job that exists in both legacy regions has two candidate originals. The
 * Gundersen text wins, falling back to Bellin; the region rows themselves are
 * kept in job_code_mappings either way.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WORKBOOK = path.join(
  ROOT,
  "database/source/Total_Rewards_sample_data_file.xlsx"
);
const OUTPUT = path.join(ROOT, "database/03_seed_data.sql");

/** Region preference when a job carries an original in more than one region. */
const REGION_PRIORITY = ["Gundersen", "Bellin"];

/* ------------------------------------------------------------------ helpers */

/**
 * Empty in this workbook means blank, a non-breaking space, "N/A", "None", or
 * a bare "0" left behind where a section had nothing to say.
 */
export function clean(value) {
  if (value === null || value === undefined) return "";
  const text = String(value)
    .replace(/ /g, " ")
    .replace(/\r\n?/g, "\n")
    .trim();
  if (!text) return "";
  if (/^(n\/?a|none|tbd|0)$/i.test(text)) return "";
  return text;
}

/** Splits a multi-line cell into individual lines, dropping empties. */
export function lines(value) {
  return clean(value)
    .split("\n")
    .map((line) => line.replace(/ /g, " ").trim())
    .filter((line) => line && !/^(n\/?a|none|tbd)$/i.test(line));
}

/**
 * Splits a duties cell into one entry per duty. Duties are written either as
 * "1. ...", "* ..." or "• ...", and a duty may wrap onto following lines, which
 * belong to the duty above them.
 */
export function splitDuties(value) {
  const raw = lines(value);
  if (!raw.length) return [];

  const START = /^\s*(?:\d+[.)]|[*•·●▪‣-])\s+/;
  const hasMarkers = raw.some((line) => START.test(line));
  if (!hasMarkers) return raw;

  const duties = [];
  for (const line of raw) {
    if (START.test(line)) {
      const text = line.replace(START, "").trim();
      if (text) duties.push(text);
    } else if (duties.length) {
      duties[duties.length - 1] = `${duties[duties.length - 1]} ${line}`.trim();
    } else if (line) {
      duties.push(line);
    }
  }
  return duties;
}

/**
 * Strips a REQUIRED/PREFERRED/DESIRED suffix the source text already carries,
 * so appending our own marker cannot produce "... preferred Preferred".
 */
function stripMarker(text) {
  return text.replace(/(?:\s*[-–—]\s*|\s+)(required|preferred|desired)\s*$/i, "").trim();
}

/**
 * Builds the `other_job_description` blob for one side (original or updated).
 *
 * The format is exactly what parseJobDescriptionSections in
 * shared/job-description-fields.ts reads back: a bare header line followed by
 * "•" bullets, each REQUIRED/DESIRED bullet carrying its marker at the end.
 * Header spellings must stay in BUCKET_BY_HEADER — an unrecognised header is
 * treated as a wrapped continuation of the bullet above it and would corrupt
 * the preceding element.
 */
export function buildBlob(cells) {
  const out = [];

  const section = (header, items) => {
    const kept = items.filter(Boolean);
    if (!kept.length) return;
    out.push(header);
    for (const item of kept) out.push(`• ${item}`);
  };

  const marked = (value, marker) =>
    lines(value).map((line) => `${stripMarker(line)} ${marker}`);

  section("Education", [
    ...marked(cells.educationRequired, "Required"),
    ...marked(cells.educationDesired, "Preferred"),
  ]);

  section("Experience", [
    ...marked(cells.experienceRequired, "Required"),
    ...marked(cells.experienceDesired, "Preferred"),
  ]);

  section("Certification Registration_Licensure", [
    ...marked(cells.certificationRequired, "Required"),
    ...marked(cells.certificationDesired, "Preferred"),
  ]);

  section("Environmental Conditions", lines(cells.environmentalConditions));

  // The physical-requirements cell repeats its own heading as the first line,
  // spelled "Requirement" rather than the "Requirements" the parser knows.
  // Drop it and emit the canonical header instead.
  const physical = lines(cells.physicalRequirements).filter(
    (line) => !/^physical requirements?\s*\/\s*demands of the position$/i.test(line)
  );
  section("Physical Requirements/Demands of the Position", physical);

  // Recognised by the parser as a header it deliberately skips, so the content
  // is preserved in the blob without being absorbed into the element above.
  section("Core for Leaders", lines(cells.coreForLeaders));

  return out.join("\n");
}

/* --------------------------------------------------------------- extraction */

/** Column offsets in the "Summary Table" sheet, keyed off the header row. */
const JOB_COLS = {
  region: 0,
  jobCode: 1,
  goForwardCode: 2,
  currentJobTitle: 3,
  proposedJobTitle: 4,
  jobFamily: 5,
  jobFunction: 6,
  careerStage: 7,
  careerLevelName: 8,
  careerLevel: 9,
};

/** The 11 JD content columns, repeated for original (offset 10) and updated (21). */
function contentCells(row, offset) {
  return {
    positionSummary: row[offset + 0],
    essentialDuties: row[offset + 1],
    educationRequired: row[offset + 2],
    educationDesired: row[offset + 3],
    certificationRequired: row[offset + 4],
    certificationDesired: row[offset + 5],
    experienceRequired: row[offset + 6],
    experienceDesired: row[offset + 7],
    coreForLeaders: row[offset + 8],
    environmentalConditions: row[offset + 9],
    physicalRequirements: row[offset + 10],
  };
}

function hasContent(cells) {
  return Object.values(cells).some((value) => clean(value) !== "");
}

function readWorkbook() {
  const workbook = XLSX.readFile(WORKBOOK);
  const sheet = workbook.Sheets["Summary Table"];
  if (!sheet) throw new Error('Sheet "Summary Table" not found in the workbook');

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: null,
    blankrows: false,
  });

  // Row 0 is the banner ("Job Data" / "Original ..." / "Updated ..."), row 1 the
  // column headers, data starts at row 2.
  const dataRows = rows.slice(2).filter((row) => clean(row[JOB_COLS.goForwardCode]));

  const jobs = new Map(); // go-forward code -> job
  const families = new Map(); // family name -> id

  for (const row of dataRows) {
    const code = clean(row[JOB_COLS.goForwardCode]);
    const region = clean(row[JOB_COLS.region]);
    const familyName = clean(row[JOB_COLS.jobFamily]) || "Unassigned";

    if (!families.has(familyName)) families.set(familyName, families.size + 1);

    let job = jobs.get(code);
    if (!job) {
      job = {
        id: jobs.size + 1,
        jobCode: code,
        jobTitle: clean(row[JOB_COLS.proposedJobTitle]),
        familyId: families.get(familyName),
        jobFunction: clean(row[JOB_COLS.jobFunction]),
        careerStage: clean(row[JOB_COLS.careerStage]),
        careerLevelName: clean(row[JOB_COLS.careerLevelName]),
        careerLevel: clean(row[JOB_COLS.careerLevel]),
        mappings: [],
        original: null,
        originalRegion: null,
        updated: null,
      };
      jobs.set(code, job);
    }

    job.mappings.push({
      region,
      legacyJobCode: clean(row[JOB_COLS.jobCode]) || code,
      currentJobTitle: clean(row[JOB_COLS.currentJobTitle]),
    });

    const original = contentCells(row, 10);
    if (hasContent(original)) {
      const better =
        !job.original ||
        REGION_PRIORITY.indexOf(region) < REGION_PRIORITY.indexOf(job.originalRegion);
      // indexOf is -1 for an unlisted region, which must not beat a listed one.
      const known = REGION_PRIORITY.indexOf(region) !== -1;
      if (!job.original || (known && better)) {
        job.original = original;
        job.originalRegion = region;
      }
    }

    const updated = contentCells(row, 21);
    if (hasContent(updated) && !job.updated) job.updated = updated;
  }

  return { jobs: [...jobs.values()], families };
}

/* ------------------------------------------------------------ sql rendering */

/**
 * SQL Server nests block comments, so a stray "/*" inside one swallows the rest
 * of the file rather than erroring. Cheap sanity check on the emitted script.
 */
function assertCommentsBalanced(script) {
  let depth = 0;
  for (let i = 0; i < script.length - 1; i++) {
    if (script[i] === "/" && script[i + 1] === "*") {
      depth++;
      i++;
      if (depth > 1) {
        throw new Error(
          `nested block comment opened at offset ${i} — it would comment out the rest of the seed`
        );
      }
    } else if (script[i] === "*" && script[i + 1] === "/" && depth > 0) {
      depth--;
      i++;
    }
  }
  if (depth !== 0) throw new Error("unterminated block comment in the generated seed");
}

/** T-SQL string literal, or NULL for empty. */
function lit(value) {
  const text = typeof value === "string" ? value : clean(value);
  if (!text) return "NULL";
  return `N'${text.replace(/'/g, "''")}'`;
}

/**
 * Emits the seed as three batches:
 *   1. the guard, which flips NOEXEC on if the database already has jobs
 *   2. the whole seed as ONE batch inside a TRY/CATCH transaction
 *   3. NOEXEC off again
 *
 * The seed deliberately contains no internal GO. A transaction spans batch
 * boundaries, but an error does not: with the inserts split across batches, a
 * failure part-way would roll back and then let the remaining batches run
 * outside any transaction, committing a half-seeded database.
 */
function buildSql({ jobs, families }) {
  const out = [];
  const warnings = [];

  const push = (line = "") => out.push(line);

  /** A table value constructor tops out at 1000 rows, so insert in chunks. */
  const insertRows = (intro, rows, indent = "") => {
    if (!rows.length) {
      push(`${indent}/* no rows */`);
      return;
    }
    for (let i = 0; i < rows.length; i += 1000) {
      push(`${indent}${intro}`);
      push(`${rows.slice(i, i + 1000).join(",\n")};`);
    }
  };

  push("/* =========================================================================");
  push("   Acme Health — seed data");
  push("   =========================================================================");
  push("   GENERATED FILE — do not edit by hand.");
  push("   Regenerate with:  node scripts/seed-from-excel.mjs");
  push(`   Source: database/source/${path.basename(WORKBOOK)}`);
  push("");
  push("   Run after 01_tables.sql and 02_procedures.sql. Refuses to run twice:");
  push("   the guard below skips the rest of the file if dbo.jobs already has rows.");
  push("");
  push("   Ids are written explicitly so job_descriptions.id can be kept equal to");
  push("   job_descriptions.job_id, which is what makes the app's");
  push("   'UPDATE job_descriptions ... WHERE id = @jobId' address the right row.");
  push("   ========================================================================= */");
  push("");
  push("SET NOCOUNT ON;");
  push("SET XACT_ABORT ON;");
  push("GO");
  push("");
  push("/* Severity 10 so this reports without raising an error: an error here would");
  push("   abort the batch before SET NOEXEC ON could take effect, and the seed would");
  push("   run anyway. */");
  push("IF EXISTS (SELECT 1 FROM dbo.jobs)");
  push("BEGIN");
  push("    RAISERROR('dbo.jobs is not empty - seed skipped. Clear the tables first if you meant to re-seed.', 10, 1) WITH NOWAIT;");
  push("    SET NOEXEC ON;");
  push("END");
  push("GO");
  push("");
  push("BEGIN TRY");
  push("BEGIN TRANSACTION;");
  push("");

  /* job_families */
  push("/* ---------------------------------------------------------- job_families */");
  push("SET IDENTITY_INSERT dbo.job_families ON;");
  insertRows(
    "INSERT INTO dbo.job_families (id, job_family) VALUES",
    [...families.entries()].map(([name, id]) => `    (${id}, ${lit(name)})`)
  );
  push("SET IDENTITY_INSERT dbo.job_families OFF;");
  push("");

  /* jobs */
  push("/* ------------------------------------------------------------------ jobs */");
  push("/* Every job starts at 'Not Started' with no reviewer: the workbook carries");
  push("   no review state. */");
  push("SET IDENTITY_INSERT dbo.jobs ON;");
  insertRows(
    "INSERT INTO dbo.jobs (id, job_code, job_title, job_family_id, job_function," +
      " career_stage, career_level_name, career_level, status) VALUES",
    jobs.map(
      (job) =>
        `    (${job.id}, ${lit(job.jobCode)}, ${lit(job.jobTitle)}, ${job.familyId}, ` +
        `${lit(job.jobFunction)}, ${lit(job.careerStage)}, ${lit(job.careerLevelName)}, ` +
        `${lit(job.careerLevel)}, N'Not Started')`
    )
  );
  push("SET IDENTITY_INSERT dbo.jobs OFF;");
  push("");

  /* job_code_mappings */
  const mappingRows = [];
  const seenMappings = new Set();
  for (const job of jobs) {
    for (const mapping of job.mappings) {
      const key = `${mapping.region}|${mapping.legacyJobCode}`;
      if (seenMappings.has(key)) {
        warnings.push(
          `duplicate region/legacy code ${key} (job ${job.jobCode}) — kept the first`
        );
        continue;
      }
      seenMappings.add(key);
      mappingRows.push(
        `    (${job.id}, ${lit(mapping.region)}, ${lit(mapping.legacyJobCode)}, ${lit(
          mapping.currentJobTitle
        )})`
      );
    }
  }
  push("/* ------------------------------------------------------ job_code_mappings */");
  push("/* The legacy per-region codes and pre-merger titles. */");
  insertRows(
    "INSERT INTO dbo.job_code_mappings (job_id, region, legacy_job_code, current_job_title) VALUES",
    mappingRows
  );
  push("");

  /* job_descriptions */
  const descriptionRows = jobs.map((job) => {
    const originalBlob = job.original ? buildBlob(job.original) : "";
    const updatedBlob = job.updated ? buildBlob(job.updated) : "";
    const summaryOriginal = job.original ? clean(job.original.positionSummary) : "";
    const summaryAi = job.updated ? clean(job.updated.positionSummary) : "";

    for (const [label, text] of [
      ["job_summary_original", summaryOriginal],
      ["job_summary_ai", summaryAi],
      ["other_job_description", originalBlob],
      ["other_job_description_ai", updatedBlob],
    ]) {
      if (text.length > 4000) {
        warnings.push(
          `job ${job.jobCode}: ${label} is ${text.length} characters — over the ` +
            "4000-character literal limit, seed with --apply instead of the .sql file"
        );
      }
      // A line reading exactly "GO" inside a literal would be eaten by sqlcmd
      // and SSMS as a batch separator, splitting the string mid-INSERT.
      if (/^[ \t]*GO[ \t]*$/im.test(text)) {
        warnings.push(
          `job ${job.jobCode}: ${label} contains a line reading "GO", which sqlcmd ` +
            "and SSMS treat as a batch separator — seed with --apply instead of the .sql file"
        );
      }
    }

    return (
      `    (${job.id}, ${job.id}, ${lit(summaryOriginal)}, ${lit(summaryAi)}, ` +
      `${lit(originalBlob)}, ${lit(updatedBlob)}, SYSDATETIME())`
    );
  });
  push("/* ----------------------------------------------------- job_descriptions */");
  insertRows(
    "INSERT INTO dbo.job_descriptions (id, job_id, job_summary_original, job_summary_ai," +
      " other_job_description, other_job_description_ai, last_updated_date) VALUES",
    descriptionRows
  );
  push("");

  /* essential functions */
  for (const [table, side] of [
    ["essential_functions_original", "original"],
    ["essential_functions_ai", "updated"],
  ]) {
    const rows = [];
    for (const job of jobs) {
      const cells = job[side];
      if (!cells) continue;
      splitDuties(cells.essentialDuties).forEach((text, index) => {
        rows.push(`    (${job.id}, ${lit(text)}, ${index + 1})`);
      });
    }
    push(`/* ${"-".repeat(Math.max(0, 62 - table.length))} ${table} */`);
    insertRows(
      `INSERT INTO dbo.${table} (job_id, function_text, sort_order) VALUES`,
      rows
    );
    push("");
  }

  push("COMMIT TRANSACTION;");
  push("END TRY");
  push("BEGIN CATCH");
  push("    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;");
  push("    THROW;");
  push("END CATCH");
  push("GO");
  push("");
  push("SET NOEXEC OFF;");
  push("GO");
  push("");

  return { sql: out.join("\n"), warnings };
}

/* ----------------------------------------------------------------- --apply */

async function apply(model) {
  const sql = (await import("mssql")).default;
  await import("dotenv/config");

  const pool = await new sql.ConnectionPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
    options: { trustServerCertificate: true, encrypt: true },
  }).connect();

  const existing = await pool.request().query("SELECT COUNT(*) AS n FROM dbo.jobs");
  if (existing.recordset[0].n > 0) {
    await pool.close();
    throw new Error(
      `dbo.jobs already has ${existing.recordset[0].n} rows — refusing to seed on top of it`
    );
  }

  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const request = () => new sql.Request(transaction);

    for (const [name, id] of model.families) {
      await request()
        .input("id", sql.Int, id)
        .input("name", sql.NVarChar(150), name)
        .query(
          "SET IDENTITY_INSERT dbo.job_families ON;" +
            " INSERT INTO dbo.job_families (id, job_family) VALUES (@id, @name);" +
            " SET IDENTITY_INSERT dbo.job_families OFF;"
        );
    }

    for (const job of model.jobs) {
      await request()
        .input("id", sql.Int, job.id)
        .input("job_code", sql.NVarChar(50), job.jobCode)
        .input("job_title", sql.NVarChar(255), job.jobTitle)
        .input("job_family_id", sql.Int, job.familyId)
        .input("job_function", sql.NVarChar(150), job.jobFunction || null)
        .input("career_stage", sql.NVarChar(100), job.careerStage || null)
        .input("career_level_name", sql.NVarChar(100), job.careerLevelName || null)
        .input("career_level", sql.NVarChar(20), job.careerLevel || null)
        .query(
          "SET IDENTITY_INSERT dbo.jobs ON;" +
            " INSERT INTO dbo.jobs (id, job_code, job_title, job_family_id, job_function," +
            " career_stage, career_level_name, career_level, status)" +
            " VALUES (@id, @job_code, @job_title, @job_family_id, @job_function," +
            " @career_stage, @career_level_name, @career_level, 'Not Started');" +
            " SET IDENTITY_INSERT dbo.jobs OFF;"
        );

      const seen = new Set();
      for (const mapping of job.mappings) {
        const key = `${mapping.region}|${mapping.legacyJobCode}`;
        if (seen.has(key)) continue;
        seen.add(key);
        await request()
          .input("job_id", sql.Int, job.id)
          .input("region", sql.NVarChar(100), mapping.region)
          .input("legacy_job_code", sql.NVarChar(50), mapping.legacyJobCode)
          .input("current_job_title", sql.NVarChar(255), mapping.currentJobTitle || null)
          .query(
            "INSERT INTO dbo.job_code_mappings (job_id, region, legacy_job_code, current_job_title)" +
              " VALUES (@job_id, @region, @legacy_job_code, @current_job_title)"
          );
      }

      await request()
        .input("id", sql.Int, job.id)
        .input(
          "job_summary_original",
          sql.NVarChar(sql.MAX),
          job.original ? clean(job.original.positionSummary) || null : null
        )
        .input(
          "job_summary_ai",
          sql.NVarChar(sql.MAX),
          job.updated ? clean(job.updated.positionSummary) || null : null
        )
        .input(
          "other_job_description",
          sql.NVarChar(sql.MAX),
          job.original ? buildBlob(job.original) || null : null
        )
        .input(
          "other_job_description_ai",
          sql.NVarChar(sql.MAX),
          job.updated ? buildBlob(job.updated) || null : null
        )
        .query(
          "INSERT INTO dbo.job_descriptions (id, job_id, job_summary_original, job_summary_ai," +
            " other_job_description, other_job_description_ai, last_updated_date)" +
            " VALUES (@id, @id, @job_summary_original, @job_summary_ai," +
            " @other_job_description, @other_job_description_ai, SYSDATETIME())"
        );

      for (const [table, side] of [
        ["essential_functions_original", "original"],
        ["essential_functions_ai", "updated"],
      ]) {
        const cells = job[side];
        if (!cells) continue;
        const duties = splitDuties(cells.essentialDuties);
        for (let index = 0; index < duties.length; index++) {
          await request()
            .input("job_id", sql.Int, job.id)
            .input("function_text", sql.NVarChar(sql.MAX), duties[index])
            .input("sort_order", sql.Int, index + 1)
            .query(
              `INSERT INTO dbo.${table} (job_id, function_text, sort_order)` +
                " VALUES (@job_id, @function_text, @sort_order)"
            );
        }
      }
    }

    await transaction.commit();
    console.log("Seeded the database.");
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await pool.close();
  }
}

/* -------------------------------------------------------------------- main */

async function main() {
  const model = readWorkbook();
  const { sql: script, warnings } = buildSql(model);

  assertCommentsBalanced(script);

  // Written with a UTF-8 BOM: the data carries curly quotes and en-dashes, and
  // without the BOM sqlcmd reads the file in the machine's ANSI code page and
  // mangles them. SSMS honours the BOM too.
  fs.writeFileSync(OUTPUT, `﻿${script}\n`, "utf8");

  const duties = (side) =>
    model.jobs.reduce(
      (total, job) =>
        total + (job[side] ? splitDuties(job[side].essentialDuties).length : 0),
      0
    );

  console.log(`Wrote ${path.relative(ROOT, OUTPUT)}`);
  console.log(`  job families            ${model.families.size}`);
  console.log(`  jobs                    ${model.jobs.length}`);
  console.log(
    `  legacy code mappings    ${model.jobs.reduce((n, j) => n + j.mappings.length, 0)}`
  );
  console.log(
    `  jobs with an original   ${model.jobs.filter((j) => j.original).length}`
  );
  console.log(
    `  jobs with an update     ${model.jobs.filter((j) => j.updated).length}`
  );
  console.log(`  duties (original / ai)  ${duties("original")} / ${duties("updated")}`);

  for (const warning of warnings) console.warn(`  ! ${warning}`);

  if (process.argv.includes("--apply")) await apply(model);
}

// Guarded so the helpers above can be imported by tests without seeding.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
