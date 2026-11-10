/**
 * Word-level track-changes diffing for the job description panels.
 *
 * Shared by every element the Compare Versions page marks up, so the position
 * summary, the essential job duties and the editable JD elements all read the
 * same way.
 */

export interface DiffSegment {
  type: "unchanged" | "added" | "removed" | "modified";
  text: string;
  lineNumber?: number;
}

/**
 * Splits both sides into words (keeping the whitespace runs as their own
 * tokens, so spacing survives the round trip) and walks an LCS table to label
 * each token unchanged / removed / added.
 */
export function createWordDiff(original: string, current: string): DiffSegment[] {
  // `"".split(...)` yields `[""]`, so two empty sides would otherwise "match"
  // and hand the caller one unchanged segment of empty text to render.
  if (!original && !current) return [];

  const originalWords = original.split(/(\s+|[\n\r]+)/);
  const currentWords = current.split(/(\s+|[\n\r]+)/);

  const lcs = (arr1: string[], arr2: string[]) => {
    const m = arr1.length;
    const n = arr2.length;
    const dp = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const changes: DiffSegment[] = [];
    let i = m,
      j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
        changes.unshift({ type: "unchanged", text: arr1[i - 1] });
        i--;
        j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
        changes.unshift({ type: "removed", text: arr1[i - 1] });
        i--;
      } else {
        changes.unshift({ type: "added", text: arr2[j - 1] });
        j--;
      }
    }

    return changes;
  };

  return lcs(originalWords, currentWords);
}

/**
 * Regroups segments into one array per line, so a diff over a "\n"-joined list
 * can be rendered back as bullets. Empty fragments are dropped, which is what
 * makes a wholly deleted list collapse to nothing rather than a blank bullet.
 */
export function groupDiffSegmentsByLines(segments: DiffSegment[]): DiffSegment[][] {
  const lines: DiffSegment[][] = [];
  let currentLine: DiffSegment[] = [];

  segments.forEach((segment) => {
    const splitText = segment.text.split(/\r?\n/);
    splitText.forEach((line, index) => {
      if (line !== "") {
        currentLine.push({ ...segment, text: line });
      }
      if (index < splitText.length - 1) {
        lines.push(currentLine);
        currentLine = [];
      }
    });
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/** Track-changes highlighting for one segment. */
export function diffSegmentClassName(type: DiffSegment["type"]): string {
  switch (type) {
    case "added":
      return "bg-green-100 text-green-800 font-medium";
    case "removed":
      return "bg-red-100 text-red-800 line-through";
    case "modified":
      return "bg-yellow-100 text-yellow-800 font-medium";
    default:
      return "";
  }
}

/**
 * A plain list pushed through the diff renderer with nothing highlighted, so
 * the original and the current column share one rendering path and line up.
 */
export function unchangedSegments(items: string[]): DiffSegment[] {
  return items.length ? [{ type: "unchanged", text: items.join("\n") }] : [];
}
