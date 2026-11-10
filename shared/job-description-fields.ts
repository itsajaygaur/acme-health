/**
 * Parsing and labelling for the Acme Health job description elements.
 *
 * Everything beyond the position summary and the essential job duties is stored
 * as a single un-parsed text blob in `job_descriptions.other_job_description`.
 * The blob is a flat list of sections: a bare header line followed by "•"
 * bullets, with each bullet carrying a trailing "Required" / "Preferred" marker
 * that decides whether it is a REQUIRED or a DESIRED item.
 */

export interface JobDescriptionSections {
  educationRequired: string[];
  educationDesired: string[];
  experienceRequired: string[];
  experienceDesired: string[];
  certificationRequired: string[];
  certificationDesired: string[];
  environmentalConditions: string[];
  physicalRequirements: string[];
}

/** Labels for the two elements that remain editable and tracked. */
export const JD_LABELS = {
  positionSummary: "Position Summary",
  essentialFunctions: "Essential Job Duties_Major Responsibilities",
} as const;

/**
 * What a Functional Leader may do with an element on the Updated panel:
 * - "editable": edit the list directly.
 * - "comment":  read-only, but changes can be requested via the comment box.
 * - "readonly": read-only, no change route.
 */
export type JdSectionEditability = "editable" | "comment" | "readonly";

/** The elements below the essential job duties, in display order. */
export const JD_SECTIONS: ReadonlyArray<{
  key: keyof JobDescriptionSections;
  label: string;
  editability: JdSectionEditability;
}> = [
  {
    key: "educationRequired",
    label: "Education REQUIRED",
    editability: "comment",
  },
  {
    key: "educationDesired",
    label: "Education DESIRED",
    editability: "editable",
  },
  {
    key: "experienceRequired",
    label: "Experience REQUIRED",
    editability: "comment",
  },
  {
    key: "experienceDesired",
    label: "Experience DESIRED",
    editability: "editable",
  },
  {
    key: "certificationRequired",
    label: "Certification Registration_Licensure REQUIRED",
    editability: "comment",
  },
  {
    key: "certificationDesired",
    label: "Certification Registration_Licensure DESIRED",
    editability: "editable",
  },
  {
    key: "environmentalConditions",
    label: "Environmental Conditions",
    editability: "readonly",
  },
  {
    key: "physicalRequirements",
    label: "Physical Requirements/Demands of the Position",
    editability: "readonly",
  },
];

/** Elements a Functional Leader can edit, so their edits are persisted. */
export const JD_EDITABLE_SECTION_KEYS = JD_SECTIONS.filter(
  (section) => section.editability === "editable"
).map((section) => section.key);

/**
 * Reviewer edits to the editable elements. A key is present only once that
 * element has been saved at least once; an absent key means "never edited",
 * so the value parsed from the original blob still stands.
 */
export type JobDescriptionSectionChanges = Partial<
  Record<keyof JobDescriptionSections, string[]>
>;

export function isEditableSectionKey(
  key: string
): key is keyof JobDescriptionSections {
  return (JD_EDITABLE_SECTION_KEYS as string[]).includes(key);
}

/**
 * Groups `jd_section_changes` rows into reviewer edits per element. A key is
 * present once that element has been saved, even when it was saved empty (a
 * single row with sort_order < 0), so deleted items do not reappear.
 */
export function groupSectionChanges(
  rows: Array<{ section_key: string; item_text: string; sort_order: number }>
): JobDescriptionSectionChanges {
  const changes: JobDescriptionSectionChanges = {};
  for (const row of rows) {
    if (!isEditableSectionKey(row.section_key)) continue;
    const items = (changes[row.section_key] ??= []);
    if (row.sort_order >= 0) items.push(row.item_text);
  }
  return changes;
}

/**
 * The signed-off elements: the reviewer's edits where an element was saved,
 * otherwise the updated text. `??`, not `||`, so an element the reviewer
 * deliberately emptied stays empty.
 */
export function effectiveJobDescriptionSections(
  updated: JobDescriptionSections,
  changes: JobDescriptionSectionChanges
): JobDescriptionSections {
  const sections = emptyJobDescriptionSections();
  for (const { key } of JD_SECTIONS) {
    sections[key] = changes[key] ?? updated[key];
  }
  return sections;
}

/**
 * Elements a Functional Leader cannot edit directly: change requests for these
 * go through the comment box shown underneath the element.
 */
export const JD_COMMENTABLE_SECTION_KEYS = JD_SECTIONS.filter(
  (section) => section.editability === "comment"
).map((section) => section.key);

/**
 * Where a comment whose section_key is missing or no longer commentable is
 * shown. Every comment must land under some element: the editing page sends
 * back every comment it loaded, and PUT /api/job-description deletes the
 * caller's comments that are missing from that payload — so a comment nothing
 * renders is a comment the next save destroys.
 */
export const DEFAULT_COMMENT_SECTION_KEY: keyof JobDescriptionSections =
  JD_COMMENTABLE_SECTION_KEYS[0];

export function isCommentableSectionKey(
  key?: string | null
): key is keyof JobDescriptionSections {
  return !!key && (JD_COMMENTABLE_SECTION_KEYS as string[]).includes(key);
}

/** The element a comment belongs to, falling back for unknown keys. */
export function commentSectionKey(
  key?: string | null
): keyof JobDescriptionSections {
  return isCommentableSectionKey(key) ? key : DEFAULT_COMMENT_SECTION_KEY;
}

/** Display label for a section key, for the exports and the HR report. */
export function jdSectionLabel(key?: string | null): string {
  return JD_SECTIONS.find((section) => section.key === key)?.label ?? "";
}

/**
 * A reviewer comment on one JD element. `isEditable` is derived per request by
 * the server: a comment is editable by its author, and one with no author is
 * editable by anyone.
 */
export interface JdComment {
  id: number;
  sectionKey: string;
  comment: string;
  category: string;
  author: string;
  createdAt: string;
  isEditable: boolean;
  isCritical: boolean;
}

export function emptyJobDescriptionSections(): JobDescriptionSections {
  return {
    educationRequired: [],
    educationDesired: [],
    experienceRequired: [],
    experienceDesired: [],
    certificationRequired: [],
    certificationDesired: [],
    environmentalConditions: [],
    physicalRequirements: [],
  };
}

/**
 * Sections we split into REQUIRED / DESIRED, plus the two flat sections that
 * have no data today. Headers mapped to "ignored" (Core for Leaders, Knowledge
 * Skills & Abilities, Field of Study, Additional Licenses and Certifications)
 * are recognised as headers so their bullets are skipped rather than absorbed
 * by the section above them.
 */
type SplitBucket = "education" | "experience" | "certification";
type FlatBucket = "environmentalConditions" | "physicalRequirements";
type Bucket = SplitBucket | FlatBucket | "ignored";

const BUCKET_BY_HEADER: Record<string, Bucket> = {
  "education": "education",
  "experience": "experience",
  "licenses and certifications": "certification",
  "certification registration_licensure": "certification",
  "environmental conditions": "environmentalConditions",
  "physical requirements": "physicalRequirements",
  "physical demands": "physicalRequirements",
  "physical requirements/demands": "physicalRequirements",
  "physical requirements/demands of the position": "physicalRequirements",
  // Recognised but deliberately not displayed.
  "core for leaders": "ignored",
  "knowledge, skills, and abilities": "ignored",
  "knowledge, skills and abilities": "ignored",
  "field of study": "ignored",
  "additional licenses and certifications": "ignored",
};

const BULLET_PREFIX = /^[•·●▪‣\-*\s]+/;
const MARKER = /(?:\s*[-–—]\s*|\s+)(required|preferred|desired)\s*$/i;
const EMPTY_ITEM = /^(n\/?a|none|tbd)[.\s]*$/i;

function normalizeHeader(line: string): string {
  return line.trim().toLowerCase().replace(/\s+/g, " ").replace(/:$/, "");
}

function isBullet(line: string): boolean {
  return /^[•·●▪‣]/.test(line.trim());
}

/**
 * Parses the `other_job_description` blob into the displayed elements.
 * Always returns a full object, so callers never have to null-check a section.
 */
export function parseJobDescriptionSections(
  blob?: string | null
): JobDescriptionSections {
  const sections = emptyJobDescriptionSections();
  if (!blob || !blob.trim()) return sections;

  // Raw bullets per bucket, before the REQUIRED/DESIRED marker is stripped.
  const raw: Record<SplitBucket | FlatBucket, string[]> = {
    education: [],
    experience: [],
    certification: [],
    environmentalConditions: [],
    physicalRequirements: [],
  };

  let bucket: Bucket | null = null;

  for (const line of blob.replace(/\r\n?/g, "\n").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Headers never start with a bullet glyph, so test for a bullet first: a
    // bullet whose text happens to read like a header must stay a bullet.
    if (!isBullet(trimmed)) {
      const header = BUCKET_BY_HEADER[normalizeHeader(trimmed)];
      if (header) {
        bucket = header;
        continue;
      }
      // Not a bullet and not a known header: a wrapped continuation of the
      // previous bullet. Anything before the first header is ignored.
      if (bucket && bucket !== "ignored") {
        const items = raw[bucket];
        if (items.length) {
          items[items.length - 1] = `${items[items.length - 1]} ${trimmed}`;
          continue;
        }
      }
      continue;
    }

    if (!bucket || bucket === "ignored") continue;

    // Some records double up the glyph ("• •\tStrong verbal ..."), so strip
    // every leading bullet/whitespace run rather than just the first.
    const text = trimmed.replace(BULLET_PREFIX, "").trim();
    if (!text) continue;
    raw[bucket].push(text);
  }

  for (const key of ["environmentalConditions", "physicalRequirements"] as const) {
    sections[key] = raw[key]
      .map((item) => item.replace(MARKER, "").trim())
      .filter((item) => item && !EMPTY_ITEM.test(item));
  }

  const splits: Array<[SplitBucket, keyof JobDescriptionSections, keyof JobDescriptionSections]> = [
    ["education", "educationRequired", "educationDesired"],
    ["experience", "experienceRequired", "experienceDesired"],
    ["certification", "certificationRequired", "certificationDesired"],
  ];

  for (const [source, requiredKey, desiredKey] of splits) {
    for (const item of raw[source]) {
      const match = item.match(MARKER);
      const text = (match ? item.slice(0, match.index) : item).trim();
      if (!text || EMPTY_ITEM.test(text)) continue;
      // An unmarked bullet reads as a baseline requirement; dropping it would
      // silently lose real content (e.g. "• Grad or Equiv").
      const desired = !!match && /^(preferred|desired)$/i.test(match[1]);
      sections[desired ? desiredKey : requiredKey].push(text);
    }
  }

  return sections;
}
