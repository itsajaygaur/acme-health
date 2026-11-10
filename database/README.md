# Acme Health database

Everything needed to take an empty SQL Server database to a running Acme Health
instance seeded from the Total Rewards workbook.

## Run order

| # | File | What it does |
|---|------|--------------|
| 1 | `01_tables.sql` | Creates the 14 tables the server queries. Re-runnable. |
| 2 | `02_procedures.sql` | Creates the 12 stored procedures the server calls with `.execute(...)`. Uses `CREATE OR ALTER`, so re-running is safe. |
| 3 | `03_seed_data.sql` | Inserts the job data. **Generated** — see below. Refuses to run if `dbo.jobs` already has rows. |
| — | `99_reviewers.sample.sql` | Optional, and you must edit it first. Bootstraps `job_reviewers` so reviewers can be assigned in the UI. |

```bash
for f in 01_tables 02_procedures 03_seed_data; do
  sqlcmd -S "$DB_SERVER" -d "$DB_NAME" -U "$DB_USER" -P "$DB_PASSWORD" \
         -f 65001 -b -i "database/$f.sql" || break
done
```

Or paste each file into SSMS in that order. The connection variables are the
same `DB_*` ones `server/dbSql.ts` reads.

Two flags worth keeping:

- **`-f 65001`** — the files are UTF-8 and the seed data contains curly quotes
  and en-dashes. Without it older `sqlcmd` reads the file in the machine's ANSI
  code page and mangles them. `03_seed_data.sql` is written with a UTF-8 BOM as
  a second line of defence, and `--apply` (below) sidesteps the question
  entirely.
- **`-b`** — exit non-zero on error, so a failing step stops the chain instead
  of running the next file against a half-built schema.

Requires **SQL Server 2016 SP1 or later** — that is where `CREATE OR ALTER`
arrived. Everything else (`OFFSET`/`FETCH`, `THROW`, `FOR JSON PATH`) is 2016 or
earlier.

One editing hazard worth knowing: SQL Server **nests** block comments, so a
stray `/*` inside a `/* ... */` header silently comments out the rest of the
file instead of erroring. Don't write glob paths in these comments. The seed
generator asserts the script it emits has balanced comments.

## Regenerating the seed

`03_seed_data.sql` is generated from `source/Total_Rewards_sample_data_file.xlsx`
and should not be hand-edited:

```bash
node scripts/seed-from-excel.mjs          # rewrite database/03_seed_data.sql
node scripts/seed-from-excel.mjs --apply  # ...and insert straight into the DB
```

`--apply` uses parameterised inserts through `mssql`, so prefer it if any cell
ever grows past the 4000-character T-SQL literal limit — the generator prints a
warning when that happens.

## What gets seeded

From the workbook's **Summary Table** sheet (the per-job tabs are the same
content pivoted and are not read):

| Source | Destination | Rows |
|--------|-------------|------|
| Go Forward Code / Proposed Job Title | `jobs` | 27 |
| Final Job Family | `job_families` | 1 (`Human Resources`) |
| Region + legacy Job Code + Current Job Title | `job_code_mappings` | 41 |
| `POSITION SUMMARY:` (original / updated) | `job_descriptions.job_summary_original` / `job_summary_ai` | 27 |
| Education / Experience / Certification / Environmental / Physical / Core for Leaders | `job_descriptions.other_job_description` / `other_job_description_ai` | 27 |
| `ESSENTIAL JOB DUTIES` (original) | `essential_functions_original` | 294 |
| `ESSENTIAL JOB DUTIES` (updated) | `essential_functions_ai` | 288 |

Two jobs — `278` (Benefits Specialist Senior) and `2864` (Supervisor, Leave
Benefits Administrator) — are blank in the workbook beyond their title, code and
levelling, so they seed as jobs with no description content.

Every job seeds as **Not Started** with no reviewer and no comments: the
workbook carries no review state.

## Notes on the schema

A few things in here look odd but are load-bearing, so they are worth knowing
before you change them.

**`job_descriptions.id` always equals `job_descriptions.job_id`.** The app reads
this table by `job_id` but writes it by `id`:

```sql
UPDATE job_descriptions SET job_summary_changes = @jobSummaryChanges ... WHERE id = @jobId
```

Keeping the two columns equal is what makes both statements hit the same row. A
`CHECK` constraint enforces it, and the seed writes ids explicitly under
`IDENTITY_INSERT` rather than letting them be assigned.

**Two description blobs.** `other_job_description` holds the legacy job
description's Education/Experience/Certification/Environmental/Physical
elements; `other_job_description_ai` holds the updated ones. Both are the bullet
format `shared/job-description-fields.ts` parses. The `_ai` column is new: the
schema previously had one blob, which both panels of the editing page read, so
there was nowhere to put the updated elements the workbook supplies.

**Header spellings in the blob matter.** `parseJobDescriptionSections` treats a
non-bullet line it does not recognise as a header as a wrapped continuation of
the bullet above it. Emitting an unknown header therefore corrupts the element
before it. The generator only ever writes headers that appear in
`BUCKET_BY_HEADER`.

**`essential_functions` (no suffix) is a legacy table.** Nothing reads or writes
it; the only reference left is `DELETE /api/job/essentialfunction/:id`, which
would return a 500 rather than a 404 without it. Safe to drop once that route is
removed or repointed at `essential_functions_changes`.

**Reviewers are not a table of users.** The app has no local user store —
identities come from Active Directory at login and only the display name is
persisted, on `job_reviewers.reviewer` and `comments.author`. The dashboard's
Reviewers grid is derived from `job_reviewers`, which is why `email` there is
always `NULL`.

**`sp_GetDashboardSummary.total_users` is a count of jobs, not people.** The
"Total Jobs" card in `summary-cards.tsx` reads `data.totalUsers`. `revenue`,
`orders` and `growth_rate` are unused leftovers of the dashboard template and
are returned as `0`.

**"Reviewed" means "not `Not Started`"** everywhere it is counted.

## What has and has not been verified

Checked:

- All four `.sql` files parse cleanly as T-SQL, and none contains a nested
  block comment.
- Every blob the generator writes was round-tripped through the app's own
  `parseJobDescriptionSections` and compared element by element against the
  spreadsheet cells it came from: 71 blobs, zero mismatches.
- `tsc --noEmit` passes with the `other_job_description_ai` changes.

Not checked: none of this has been executed against a real SQL Server instance.
Run `01`/`02` against a scratch database before pointing them at anything that
matters.

## Active Directory config

Login needs one row in `configuration` with `title = 'active-directory'` and
`is_active = 1`. Create it through `POST /api/config` (admin only) so the
payload gets encrypted by `server/crypto.ts`. For local development the read
path also accepts plaintext JSON — anything starting with `{` is used as-is:

```sql
INSERT INTO dbo.configuration (title, json_text, is_active)
VALUES (N'active-directory', N'{"server":"ldap://your-dc","port":389,"baseDN":"dc=example,dc=com","bindDN":"cn=svc,dc=example,dc=com","bindPassword":"...","searchFilter":"(sAMAccountName={{username}})"}', 1);
```

Do not commit a row like that with a real bind password.
